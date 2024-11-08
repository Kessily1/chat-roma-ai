const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let usuariosOnline = 0;

app.use(express.static(path.join(__dirname, 'front')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'login.html'));
});

app.get('/api/username', (req, res) => {
    const username = req.query.username;
    if (username) {
        res.json({ success: true, username });
    } else {
        res.json({ success: false, message: 'Nome de usuário não fornecido' });
    }
});

// Funções para buscar imagens
async function fetchCatImage() {
    const response = await axios.get('https://api.thecatapi.com/v1/images/search');
    return response.data[0].url;
}

async function fetchDogImage() {
    const response = await axios.get('https://random.dog/woof.json');
    return response.data.url;
}

async function fetchFoxImage() {
    const response = await axios.get('https://randomfox.ca/floof/');
    return response.data.image;
}

async function fetchUserImage() {
    const response = await axios.get('https://randomuser.me/api/');
    return response.data.results[0].picture.large;
}

// Endpoints HTTP para buscar imagens
app.get('/api/cat', async (req, res) => {
    try {
        const catImageUrl = await fetchCatImage();
        res.json({ url: catImageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar imagem de gato' });
    }
});

app.get('/api/dog', async (req, res) => {
    try {
        const dogImageUrl = await fetchDogImage();
        res.json({ url: dogImageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar imagem de cachorro' });
    }
});

app.get('/api/fox', async (req, res) => {
    try {
        const foxImageUrl = await fetchFoxImage();
        res.json({ url: foxImageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar imagem de raposa' });
    }
});

app.get('/api/user', async (req, res) => {
    try {
        const userImageUrl = await fetchUserImage();
        res.json({ url: userImageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar imagem de usuário' });
    }
});

// Endpoints HTTP para chamar a API da OpenAI para texto e imagens
app.post('/api/openai/text', async (req, res) => {
    const { message } = req.body;
    try {
        const response = await generateOpenAIResponse(message);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar resposta de texto' });
    }
});

app.post('/api/openai/image', async (req, res) => {
    const { description } = req.body;
    try {
        const imageUrl = await generateOpenAIImage(description);
        res.json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar imagem' });
    }
});

io.on('connection', (socket) => {
    usuariosOnline++;
    io.emit('usuariosOnline', usuariosOnline);

    socket.on('setUsername', (username) => {
        socket.username = username;
        io.emit('userStatus', `${username} entrou no chat`);
    });

    socket.on('message', (msg) => {
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        usuariosOnline--;
        io.emit('usuariosOnline', usuariosOnline);
        io.emit('userStatus', `${socket.username} saiu do chat`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});