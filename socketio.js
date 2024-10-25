const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const axios = require('axios');
require('dotenv').config(); // Carrega as variáveis de ambiente

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let usuariosOnline = 0;
let usuarios = {}; 

app.use(express.static(__dirname));
app.use(express.json());

// Rota para integração com a API da OpenAI (respostas de texto)
app.post('/openai/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const response = await generateOpenAIResponse(userMessage);
        res.json(response);
    } catch (error) {
        console.error('Erro ao chamar a API da OpenAI:', error.response ? error.response.data : error.message);
        res.status(500).send('Desculpe, não consegui entender sua mensagem.');
    }
});

// Rota para integração com a API da OpenAI (geração de imagens)
app.post('/openai/image', async (req, res) => {
    const imageDescription = req.body.description;
    try {
        const response = await generateOpenAIImage(imageDescription);
        res.json({ url: response });
    } catch (error) {
        console.error('Erro ao chamar a API da OpenAI para gerar imagem:', error.response ? error.response.data : error.message);
        res.status(500).send('Desculpe, houve um erro ao gerar a imagem.');
    }
});

io.on('connection', (socket) => {
    console.log('Usuário conectado: ' + socket.id);

    socket.on('setUsername', (user) => {
        if (!user || Object.values(usuarios).includes(user)) {
            socket.emit('userStatus', 'Nome de usuário inválido ou já em uso.');
            return;
        }
        usuarios[socket.id] = user;
        usuariosOnline++;
        io.emit('usuariosOnline', usuariosOnline);
        io.emit('userStatus', `${user} entrou no chat`);
    });

    socket.on('message', async (msg) => {
        console.log('Mensagem recebida:', msg); // Log da mensagem recebida
        io.emit('message', msg); // Envia a mensagem para todos os usuários
        
        // Extrai o nome de usuário e a mensagem separadamente
        const splitMsg = msg.split(':');
        if (splitMsg.length < 2) {
            io.emit('message', 'Mensagem inválida.');
            return;
        }
        
        const commandMsg = splitMsg.slice(1).join(':').trim(); // Mensagem após o ":"
        
        // Verifica se a mensagem após o nome de usuário começa com "/text "
        if (commandMsg.toLowerCase().startsWith('/text ')) {
            const userMessage = commandMsg.slice(6).trim(); 
            console.log('Comando /text detectado. Conteúdo da mensagem:', userMessage);
            
            if (userMessage) {
                try {
                    const response = await generateOpenAIResponse(userMessage);
                    io.emit('message', `Resposta do chatbot: ${response}`);
                } catch (error) {
                    console.error('Erro ao gerar resposta:', error);
                    io.emit('message', 'Desculpe, houve um erro ao gerar a resposta.');
                }
            } else {
                io.emit('message', 'Comando /text detectado, mas nenhuma mensagem foi encontrada após o comando. Digite algo após /text para obter uma resposta.');
            }
    
        // Verifica se a mensagem começa com "/image "
        } else if (commandMsg.toLowerCase().startsWith('/image ')) {
            const imageDescription = commandMsg.slice(7).trim();
            console.log('Comando /image detectado. Descrição da imagem:', imageDescription);
    
            if (imageDescription) {
                try {
                    const responseUrl = await generateOpenAIImage(imageDescription);
                    io.emit('message', `Imagem gerada: ${responseUrl}`);
                } catch (error) {
                    console.error('Erro ao gerar imagem:', error);
                    io.emit('message', 'Desculpe, houve um erro ao gerar a imagem.');
                }
            } else {
                io.emit('message', 'Comando /image detectado, mas nenhuma descrição foi encontrada. Digite uma descrição após /image para gerar uma imagem.');
            }
            
        } else {
            
        }
    });
    
    
    

    socket.on('disconnect', () => {
        const user = usuarios[socket.id];
        console.log('Usuário desconectado: ' + socket.id);
        if (user) {
            usuariosOnline--;
            delete usuarios[socket.id];
            io.emit('usuariosOnline', usuariosOnline);
            io.emit('userStatus', `${user} saiu do chat`);
        }
    });
});

// Função para chamar a API da OpenAI para texto
async function generateOpenAIResponse(message) {
    console.log('Chamando a API da OpenAI com a mensagem:', message);
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Erro ao chamar a API da OpenAI:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Função para chamar a API da OpenAI para imagens
async function generateOpenAIImage(description) {
    console.log('Chamando a API da OpenAI para gerar imagem com a descrição:', description);
    try {
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            prompt: description,
            n: 1,
            size: '1024x1024',
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.data[0].url;
    } catch (error) {
        console.error('Erro ao chamar a API da OpenAI para gerar imagem:', error.response ? error.response.data : error.message);
        throw error;
    }
}

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/chat.html");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
