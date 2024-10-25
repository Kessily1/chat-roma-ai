const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const axios = require('axios');
require('dotenv').config(); 
console.log('Chave da API da OpenAI:', process.env.OPENAI_API_KEY);

const app = express();
const server = http.createServer(app);
const io = socketio(server);

require('dotenv').config();
const openApiKey = process.env.OPENAI_API_KEY;

let usuariosOnline = 0; 
let usuarios = {};

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('Usuário conectado: ' + socket.id);

    // Conectando usuário e enviando o nome:
    socket.on('setUsername', (user) => { 
        if (!user || Object.values(usuarios).includes(user)) {
            socket.emit('userStatus', 'Nome de usuário inválido ou já em uso.');
            return;
        }
        usuarios[socket.id] = user; // Guarda nome do usuário
        usuariosOnline++;
        io.emit('usuariosOnline', usuariosOnline);
        io.emit('userStatus', `${user} entrou no chat`); // Notificação geral de entrada
    });

    socket.on('message', async (msg) => { 
        console.log('Mensagem recebida:', msg); 
        io.emit('message', msg); 

        // Chama a API 
        const response = await generateOpenAIResponse(msg);
        console.log('Resposta gerada pela OpenAI:', response); 
        if (response) {
            io.emit('message', response); 
        }
    });

    socket.on('disconnect', () => {
        const user = usuarios[socket.id]; // Remove nome usuário
        console.log('Usuário desconectado: ' + socket.id);
        if (user) {
            usuariosOnline--;
            delete usuarios[socket.id]; // Remove o usuário da lista
            io.emit('usuariosOnline', usuariosOnline);
            io.emit('userStatus', `${user} saiu do chat`); // Notificação saída usuário
        }
    });
});

// Função para chamar a API da OpenAI
async function generateOpenAIResponse(message) {
    console.log('Chamando a API da OpenAI com a mensagem:', message); // Log antes da chamada
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', // Você pode usar o modelo desejado
            messages: [{ role: 'user', content: message }],
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Resposta da API:', response.data); // Resposta da API
        return response.data.choices[0].message.content; 
        
    } catch (error) {

        console.error('Erro ao chamar a API da OpenAI:', error.response ? error.response.data : error.message);
        return 'Desculpe, não consegui entender sua mensagem.'; // Mensagem em caso de erro
       
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


