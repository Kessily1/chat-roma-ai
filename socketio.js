/*
const express = require('express')
const httpt = require('http')
const socketio = require('socket.io')

const app = express()
const server = httpt.createServer(app)
const io = socketio(server)

let usuariosOnline = 0; // Contador de usuários online 

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('usuario conectado' + socket.id)
  usuariosOnline++;
  io.emit('usuariosOnline', usuariosOnline); 
  io.emit('userStatus', `${socket.id} entrou no chat`); // Notifica todos sobre a entrada

  socket.on('message', (msg) => {
    console.log (msg);
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado: ' + socket.id);
    usuariosOnline--;
    io.emit('usuariosOnline', usuariosOnline);
    io.emit('userStatus', `${socket.id} saiu do chat`); // Notifica todos sobre a saída
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/chat.html")
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

//aqui vai o socketio

server.listen(3000) */

const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let usuariosOnline = 0; // Contador de usuários online
let usuarios = {}; // Armazena os nomes dos usuários conectados

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('Usuário conectado: ' + socket.id);

    // Quando o usuário se conecta, ele deve enviar seu nome
    socket.on('setUsername', (user) => { // Usei 'user' em vez de 'username'
        if (!user || Object.values(usuarios).includes(user)) {
            socket.emit('userStatus', 'Nome de usuário inválido ou já em uso.');
            return;
        }
        usuarios[socket.id] = user; // Armazena o nome do usuário
        usuariosOnline++;
        io.emit('usuariosOnline', usuariosOnline);
        io.emit('userStatus', `${user} entrou no chat`); // Notifica todos sobre a entrada
    });

    socket.on('message', (msg) => {
        console.log(msg);
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        const user = usuarios[socket.id]; // Pega o nome do usuário
        console.log('Usuário desconectado: ' + socket.id);
        if (user) {
            usuariosOnline--;
            delete usuarios[socket.id]; // Remove o usuário da lista
            io.emit('usuariosOnline', usuariosOnline);
            io.emit('userStatus', `${user} saiu do chat`); // Notifica todos sobre a saída
        }
    });
});

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
