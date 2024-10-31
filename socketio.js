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

// Função para buscar uma imagem de gato 
async function fetchCatImage() {
    const response = await axios.get('https://api.thecatapi.com/v1/images/search');
    return response.data[0].url; // Retorna a URL da imagem do gato
}

// Função para buscar uma imagem de raposa 
async function fetchFoxImage() {
    const response = await axios.get('https://randomfox.ca/floof/');
    return response.data.image; // Retorna a URL da imagem da raposa
}

// Função para buscar uma imagem de cachorro 
async function fetchDogImage() {
    const response = await axios.get('https://random.dog/woof.json');
    return response.data.url; // Retorna a URL da imagem do cachorro
}

// Função para buscar uma imagem de usuário
async function fetchUserImage() {
    const response = await axios.get('https://randomuser.me/api/');
    return response.data.results[0].picture.large; // Retorna a URL da imagem do usuário
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

        // Verificação se a mensagem é "raposa"
        if (commandMsg && commandMsg.toLowerCase() === 'raposa') {
            try {
                const foxImageUrl = await fetchFoxImage(); // Busca imagem de raposa
                io.emit('message', `Chat Bot: Aqui está sua imagem de raposa!`);
                io.emit('message', foxImageUrl); // Envia a URL da imagem
            } catch (error) {
                console.error('Erro ao enviar imagem de raposa:', error);
                io.emit('message', 'Chat Bot: Ops! Não consegui encontrar uma imagem de raposa.');
            }
        }

        // Verificação se a mensagem é "auau"
        if (commandMsg && commandMsg.toLowerCase() === 'auau') {
            try {
                const dogImageUrl = await fetchDogImage(); // Busca imagem de cachorro
                io.emit('message', `Chat Bot: Aqui está sua imagem de cachorro!`);
                io.emit('message', dogImageUrl); // Envia a URL da imagem
            } catch (error) {
                console.error('Erro ao enviar imagem de cachorro:', error);
                io.emit('message', 'Chat Bot: Ops! Não consegui encontrar uma imagem de cachorro.');
            }
        }

        // Verificação se a mensagem é "usuario"
        if (commandMsg && commandMsg.toLowerCase() === 'usuario') {
            try {
                const userImageUrl = await fetchUserImage(); // Busca imagem de usuário
                io.emit('message', `Chat Bot: Aqui está sua imagem de usuário!`);
                io.emit('message', userImageUrl); // Envia a URL da imagem
            } catch (error) {
                console.error('Erro ao enviar imagem de usuário:', error);
                io.emit('message', 'Chat Bot: Ops! Não consegui encontrar uma imagem de usuário.');
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

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
