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
app.use(express.static(__dirname )); // Serve arquivos estáticos a partir do diretório atual
app.use(express.json());            // Reconhece e analisa o corpo das requisições HTTP no formato JSON

// Rota HTTP para o Servidor
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/front/chat.html");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/front/login.html');
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

//
// Funções de imagens aleatórias a partir de texto simples: "/miau","/auau","/raposa" e "/usuário"
//
// /miau - Função para buscar uma imagem de gato 
async function fetchCatImage() {
    const response = await axios.get('https://api.thecatapi.com/v1/images/search');
    return response.data[0].url; // Retorna a URL da imagem do gato
}

// /raposa - Função para buscar uma imagem de raposa 
async function fetchFoxImage() {
    const response = await axios.get('https://randomfox.ca/floof/');
    return response.data.image; // Retorna a URL da imagem da raposa
}

// /auau - Função para buscar uma imagem de cachorro 
async function fetchDogImage() {
    const response = await axios.get('https://random.dog/woof.json');
    return response.data.url; // Retorna a URL da imagem do cachorro
}

// /usuário - Função para buscar uma imagem de usuário
async function fetchUserImage() {
    const response = await axios.get('https://randomuser.me/api/');
    return response.data.results[0].picture.large; // Retorna a URL da imagem do usuário
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

// Conectando usuário ao Servidor:

    // Emite audio no login:
    io.on('connection', (socket) => {
        console.log('Usuário conectado: ' + socket.id); // <- informa usuario conectado
        const login_audio = '../audio/easychatlogin.mp3'; // <- toca arquivo mp3
        socket.emit('playAudio', login_audio);    

    // Configuração de nome de usuário:
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
  

    // Tratamento de mensagem recebida:
    socket.on('message', async (msg) => {
        const newMessageAudio = '../audio/newmessage.mp3'; // <<--- caminho relativo do audio
        console.log('Mensagem recebida:', msg); 
        io.emit('message', msg); 
        socket.emit('playAudio',newMessageAudio); // <<<<---- chama o audio receber / enviar mensagem

        // Extrai o nome de usuário e a mensagem separadamente:
        const splitMsg = msg.split(':');
        if (splitMsg.length < 2) {
            io.emit('message', 'Ops! Mensagem inválida.');
            return;
        }
        
        const commandMsg = splitMsg.slice(1).join(':').trim(); // Mensagem após o ":"
        const audioErro = '../audio/risoErro.wav';

        // Verificação se a mensagem começa com /text:
        if (commandMsg.toLowerCase().startsWith('/text')) {          
            const userMessage = commandMsg.slice(6).trim(); 
            console.log('Comando /text detectado. Conteúdo da mensagem:', userMessage);
             
            //Verifica se a mensagem não está vazia:
            if (userMessage) {
                try {
                    const response = await generateOpenAIResponse(userMessage);
                    io.emit('message', `Chat Bot: ${response}`);
                } catch (error) {
                    console.error('Erro ao gerar resposta:', error);
                    io.emit('message', 'Chat Bot: Ops! Erro ao gerar a resposta.');
                    io.emit('playAudio',audioErro);
                }
            } else {
                io.emit('message', 'Chat Bot: Ops! Comando /text detectado, mas nenhuma mensagem foi encontrada após o comando. Digite algo após /text para obter uma resposta.');
                io.emit('playAudio',audioErro);
            }              
        } 
        
        // Verificação se a mensagem começa com /image:
        if (commandMsg.toLowerCase().startsWith('/image')) {
            const imageDescription = commandMsg.slice(7).trim();
            console.log('Comando /image detectado. Descrição da imagem:', imageDescription);
            
            if (imageDescription) {
                try {
                    io.emit('message','Chat Bot: Buscando imagem, aguarde ...')
                    const responseUrl = await generateOpenAIImage(imageDescription);
                    io.emit('message', `Chat Bot: Aqui está sua imagem! ${responseUrl}`);
                } catch (error) {
                    console.error('Erro ao gerar imagem:', error);
                    io.emit('message', 'Chat Bot: Ops! Houve um erro ao gerar a imagem.');
                    io.emit('playAudio',audioErro);
                }
            } else {
                io.emit('message', 'Chat Bot: Ops! Comando /image detectado, mas nenhuma descrição foi encontrada. Digite uma descrição após /image para gerar uma imagem.');
                io.emit('playAudio',audioErro);
            }
        }

        // Verificação se a mensagem é "/miau":
        if (commandMsg && commandMsg.toLowerCase() === '/miau') {
            try {
                const somGato = '../audio/somGatoMiau.wav';     // <-- Caminho pro som do gato
                const catImageUrl = await fetchCatImage();      // Chama função imagem do gato
                io.emit('message', 'Chat Bot: Miau ? isso é coisa de gato... Achei um...');               
                io.emit('message', `Chat Bot: ${catImageUrl}`);
                io.emit('playAudio', somGato);
                
            } catch (error) {
                console.error('Erro ao enviar imagem de gato:', error);
                io.emit('message', 'Chat Bot: Ops! Não consegui encontrar uma imagem de gato.');
            }
        }

        // Verificação se a mensagem é "/raposa":
        if (commandMsg && commandMsg.toLowerCase() === '/raposa') {
            try {
                const foxImageUrl = await fetchFoxImage();  // Chamada de função imagem da Raposa
                io.emit('message', 'Chat Bot: Raposa ? Vou procura uma pra você...');
                io.emit('message', `Chat Bot: ${foxImageUrl}`);

            } catch (error) {
                console.error('Erro ao enviar imagem de raposa:', error);
                io.emit('message', 'Chat Bot: Ops! Não consegui encontrar uma imagem de raposa.');
            }
        }

        // Verificação se a mensagem é "/auau":
        if (commandMsg && commandMsg.toLowerCase() === '/auau') {
            try {
                const somDogAuau = '../audio/somDogAuau.wav';   // <--- Caminho pro som do cachorro
                const dogImageUrl = await fetchDogImage();      // Chama função imagem do Cachorro
                io.emit('message', 'Chat Bot: Auau ? isso é coisa de cachorro... Vou chamar...');
                io.emit('message', `Chat Bot: ${dogImageUrl}`);
                io.emit('playAudio', somDogAuau); 

            } catch (error) {
                console.error('Erro ao enviar imagem de cachorro:', error);
                io.emit('message', 'Chat Bot: Ops! Não consegui encontrar uma imagem de cachorro.');
            }
        }

        // Verificação se a mensagem é "/usuario":
        if (commandMsg && commandMsg.toLowerCase() === '/usuario') {
            try {
                const userImageUrl = await fetchUserImage(); // Chamada de função da foto do Usuário
                io.emit('message', `Chat Bot: Tome uma foto de usuário comum....`);
                io.emit('message', `Chat Bot: ${userImageUrl}`);

            } catch (error) {
                console.error('Erro ao enviar imagem de usuário:', error);
                io.emit('message', 'Chat Bot: Ops! Não consegui encontrar uma imagem de usuário.');
            }
        }

        // Verificação de mensagem /som de Gato - comando "/som de gato"
        const gato = '../audio/somGato.wav';
        if (commandMsg && commandMsg.toLowerCase() === '/som de gato'){
            io.emit('playAudio', gato);
        }

        // Verificação de mensagem som de Bode - comando "/som de bode"
        const bode = '../audio/somBode.wav';
        if (commandMsg && commandMsg.toLowerCase() === '/som de bode'){
            io.emit('playAudio', bode);
        }

        // Verificação de mensagem Star Wars - comando "/Star Wars"
        const starWars = '../audio/starWarsTheme.mp3';
        if (commandMsg && commandMsg.toLowerCase() === '/star wars'){
            io.emit('playAudio', starWars);
            io.emit('message', `Chat Bot: Que a força esteja com você ...`);
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

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
