const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const axios = require('axios');
require('dotenv').config(); 
console.log('Chave da API da OpenAI:', process.env.OPENAI_API_KEY);


const app = express();
const server = http.createServer(app);
const io = socketio(server);

let usuariosOnline = 0; // Contador de usuários online
let usuarios = {}; // Armazena os nomes dos usuários conectados

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

    // Quando o usuário se conecta, ele deve enviar seu nome
    socket.on('setUsername', (user) => { 
        if (!user || Object.values(usuarios).includes(user)) {
            socket.emit('userStatus', 'Nome de usuário inválido ou já em uso.');
            return;
        }
        usuarios[socket.id] = user; // Armazena o nome do usuário
        usuariosOnline++;
        io.emit('usuariosOnline', usuariosOnline);
        io.emit('userStatus', `${user} entrou no chat`); // Notifica todos sobre a entrada
    });

    socket.on('message', async (msg) => { // Torna a função assíncrona
        console.log('Mensagem recebida:', msg); // Log da mensagem recebida
        io.emit('message', msg); // Envia a mensagem para todos

        // Chama a API da OpenAI para gerar uma resposta
        const response = await generateOpenAIResponse(msg);
        console.log('Resposta gerada pela OpenAI:', response); // Log da resposta gerada
        if (response) {
            io.emit('message', response); // Envia a resposta gerada para todos
        }
    });
    
    
    

    socket.on('disconnect', () => {
        const user = usuarios[socket.id]; // Pega o nome do usuário
        console.log('Usuário desconectado: ' + socket.id);
        if (user) {
            usuariosOnline--;
            delete usuarios[socket.id];
            io.emit('usuariosOnline', usuariosOnline);
            io.emit('userStatus', `${user} saiu do chat`); // Notifica todos sobre a saída
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

        console.log('Resposta da API:', response.data); // Loga a resposta da API
        return response.data.choices[0].message.content; // Retorna o conteúdo da resposta
    } catch (error) {

        console.error('Erro ao chamar a API da OpenAI:', error.response ? error.response.data : error.message);
        return 'Desculpe, não consegui entender sua mensagem.'; // Mensagem padrão em caso de erro
    }
} 

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/chat.html");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Aqui vão dados do servidor e sua inicialização:
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});


