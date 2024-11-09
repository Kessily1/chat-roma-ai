// Importação dos módulos
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { handleSetUsername, handleDisconnect } = require('./server-assets/userHandlers');
const { handleMessage } = require('./server-assets/messageHandlers');
const { playLoginAudio } = require('./server-assets/audioHandlers');
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

// Rotas HTTP para o Servidor
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/front/chat.html");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/front/login.html');
});

// Conectando usuário ao Servidor:
io.on('connection', (socket) => {
    console.log('Usuário conectado: ' + socket.id); // Informa usuário conectado
    playLoginAudio(socket); // Toca arquivo mp3

    // Configuração de nome de usuário:
    socket.on('setUsername', (user) => handleSetUsername(socket, user, usuarios, usuariosOnline, io));

    // Tratamento de mensagem recebida:
    socket.on('message', (msg) => handleMessage(socket, msg, io));

    // Desconexão do usuário:
    socket.on('disconnect', () => handleDisconnect(socket, usuarios, usuariosOnline, io));

    // Evento para tocar áudio de erro
    socket.on('playErrorAudio', () => playErrorAudio(socket));
});

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
