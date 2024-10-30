// Importação dos módulos
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const axios = require('axios');
require('dotenv').config(); // Carrega as variáveis de ambiente

// Criação da aplicação e do servidor
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Declarando variáveis
let usuariosOnline = 0;
let usuarios = {}; 

// Definição do Middleware do Express
app.use(express.static(__dirname)); // Serve arquivos estáticos a partir do diretório atual
app.use(express.json());            // Reconhece e analisa o corpo das requisições HTTP no formato JSON

// Função para buscar uma imagem de gato da The Cat API
async function fetchCatImage() {
    const response = await axios.get('https://api.thecatapi.com/v1/images/search');
    return response.data[0].url; // Retorna a URL da imagem do gato
}

// Rota HTTP para o Servidor
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/front/chat.html");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/front/login.html');
});

// Conectando usuário ao Servidor
io.on('connection', (socket) => {
    console.log('Usuário conectado: ' + socket.id);
    
    // Configuração de nome de usuário
    socket.on('setUsername', (user) => {
        if (!user || Object.values(usuarios).includes(user)) {
            socket.emit('userStatus', 'Eita! Nome de usuário inválido ou já em uso.');
            return;
        }
        usuarios[socket.id] = user;
        usuariosOnline++;
        io.emit('usuariosOnline', usuariosOnline);
        io.emit('userStatus', `${user} entrou no chat`);
    });

    // Tratamento de mensagem recebida
    socket.on('message', async (msg) => {
        console.log('Mensagem recebida:', msg);
        io.emit('message', msg); // Envia a mensagem para todos os usuários
        
        const commandMsg = msg.split(':')[1]?.trim(); // Extrai a mensagem após ":"

        // Verificação se a mensagem é "miau"
        if (commandMsg && commandMsg.toLowerCase() === 'miau') {
            try {
                const catImageUrl = await fetchCatImage(); // Busca imagem de gato
                io.emit('message', `Chat Bot: Aqui está sua imagem de gato!`);
                io.emit('message', catImageUrl); // Envia a URL da imagem
            } catch (error) {
                console.error('Erro ao enviar imagem de gato:', error);
                io.emit('message', 'Chat Bot: Ops! Não consegui encontrar uma imagem de gato.');
            }
        }

        // Extrai o nome de usuário e a mensagem separadamente
        const splitMsg = msg.split(':');
        if (splitMsg.length < 2) {
            io.emit('message', 'Ops! Mensagem inválida.');
            return;
        }

        const userMessage = splitMsg.slice(1).join(':').trim();

        // Verificação de mensagem do usuário se começa com /text:
        if (userMessage.toLowerCase().startsWith('/text')) {
            const textContent = userMessage.slice(6).trim(); 
            console.log('Comando /text detectado. Conteúdo da mensagem:', textContent);

            if (textContent) {
                try {
                    const response = await generateOpenAIResponse(textContent);
                    io.emit('message', `Chat Bot: ${response}`);
                } catch (error) {
                    console.error('Erro ao gerar resposta:', error);
                    io.emit('message', 'Chat Bot: Ops! Erro ao gerar a resposta.');
                }
            } else {
                io.emit('message', 'Chat Bot: Ops! Comando /text detectado, mas nenhuma mensagem foi encontrada após o comando.');
            }
        }

        // Verificação de mensagem do usuário se começa com /image:
        if (userMessage.toLowerCase().startsWith('/image')) {
            const imageDescription = userMessage.slice(7).trim();
            console.log('Comando /image detectado. Descrição da imagem:', imageDescription);

            if (imageDescription) {
                try {
                    io.emit('message', 'Chat Bot: Buscando imagem, aguarde ...');
                    const responseUrl = await generateOpenAIImage(imageDescription);
                    io.emit('message', `Chat Bot: ${responseUrl}`);
                } catch (error) {
                    console.error('Erro ao gerar imagem:', error);
                    io.emit('message', 'Chat Bot: Ops! Houve um erro ao gerar a imagem.');
                }
            } else {
                io.emit('message', 'Chat Bot: Ops! Comando /image detectado, mas nenhuma descrição foi encontrada.');
            }
        }
    });

    // Desconectando usuário do Servidor
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

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
