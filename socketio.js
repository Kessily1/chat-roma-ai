// Importação dos módulos:
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const axios = require('axios');
require('dotenv').config(); // Carrega as variáveis de ambiente
console.log('Chave da API da OpenAI:', process.env.OPENAI_API_KEY);

// Criação da aplicação e do servidor:
const app = express();
const server = http.createServer(app);
const io = socketio(server);

require('dotenv').config();
const openApiKey = process.env.OPENAI_API_KEY;

let usuariosOnline = 0; // Contador de usuários online
let usuarios = {}; // Armazena os nomes dos usuários conectados

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('Usuário conectado: ' + socket.id);
    socket.on('setUsername', (user) => {
        if (!user || Object.values(usuarios).includes(user)) {
            socket.emit('userStatus', 'Eita! Nome de usuário inválido ou já em uso.');
            return;
        }
        usuarios[socket.id] = user;
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

    // Desconectando usuário do Servidor:
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

// Função para chamar a API da OpenAI
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

// Função para chamar a API da OpenAI para imagens:
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

async function generateOpenAIImage(prompt) {
    console.log('Chamando a API da OpenAI para gerar uma imagem com o prompt:', prompt);
    try {
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            prompt: prompt,
            n: 1, // Número de imagens a serem geradas
            size: '1024x1024', // Tamanho da imagem
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Resposta da API (imagem):', response.data); // Loga a resposta da API
        return response.data.data[0].url; // Retorna o URL da imagem
    } catch (error) {
        console.error('Erro ao chamar a API da OpenAI para imagem:', error.response ? error.response.data : error.message);
        return 'Desculpe, não consegui gerar a imagem solicitada.'; // Mensagem padrão em caso de erro
    }
}


// Rota HTTP para o Servidor:
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/front/chat.html");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/front/login.html');
});

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});


