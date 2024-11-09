const { generateOpenAIResponse, generateOpenAIImage, fetchCatImage, fetchFoxImage, fetchDogImage, fetchUserImage } = require('./utils');
const { playNewMessageAudio, playErrorAudio, playCatSound, playDogSound, playGatoSound, playBodeSound, playStarWarsTheme } = require('./audioHandlers');

async function handleCommand(socket, io, command, handler, successMessage, errorMessage, sound) {
    try {
        const result = await handler();
        io.emit('message', successMessage);
        io.emit('message', `Chat Bot: ${result}`);
        if (sound) sound(socket);
    } catch (error) {
        console.error(errorMessage, error);
        io.emit('message', `Chat Bot: ${errorMessage}`);
        playErrorAudio(socket);
    }
}

async function handleMessage(socket, msg, io) {
    console.log('Mensagem recebida:', msg); 
    io.emit('message', msg); 
    playNewMessageAudio(socket);

    const splitMsg = msg.split(':');
    if (splitMsg.length < 2) {
        io.emit('message', 'Ops! Mensagem inválida.');
        playErrorAudio(socket);
        return;
    }
    
    const commandMsg = splitMsg.slice(1).join(':').trim();

    if (commandMsg.toLowerCase().startsWith('/text')) {          
        const userMessage = commandMsg.slice(6).trim(); 
        console.log('Comando /text detectado. Conteúdo da mensagem:', userMessage);
         
        if (userMessage) {
            try {
                const response = await generateOpenAIResponse(userMessage);
                io.emit('message', `Chat Bot: ${response}`);
            } catch (error) {
                console.error('Erro ao gerar resposta:', error);
                io.emit('message', 'Chat Bot: Ops! Erro ao gerar a resposta.');
                playErrorAudio(socket);
            }
        } else {
            io.emit('message', 'Chat Bot: Ops! Comando /text detectado, mas nenhuma mensagem foi encontrada após o comando. Digite algo após /text para obter uma resposta.');
            playErrorAudio(socket);
        }              
    } else if (commandMsg.toLowerCase().startsWith('/image')) {
        const imageDescription = commandMsg.slice(7).trim();
        console.log('Comando /image detectado. Descrição da imagem:', imageDescription);
        
        if (imageDescription) {
            try {
                io.emit('message', 'Chat Bot: Buscando imagem, aguarde ...');
                const responseUrl = await generateOpenAIImage(imageDescription);
                io.emit('message', `Chat Bot: Aqui está sua imagem! ${responseUrl}`);
            } catch (error) {
                console.error('Erro ao gerar imagem:', error);
                io.emit('message', 'Chat Bot: Ops! Houve um erro ao gerar a imagem.');
                playErrorAudio(socket);
            }
        } else {
            io.emit('message', 'Chat Bot: Ops! Comando /image detectado, mas nenhuma descrição foi encontrada. Digite uma descrição após /image para gerar uma imagem.');
            playErrorAudio(socket);
        }
    } else {
        const commands = {
            '/miau': { handler: fetchCatImage, successMessage: 'Chat Bot: Miau? Isso é coisa de gato... Achei um...', errorMessage: 'Ops! Não consegui encontrar uma imagem de gato.', sound: playCatSound },
            '/raposa': { handler: fetchFoxImage, successMessage: 'Chat Bot: Raposa? Vou procurar uma pra você...', errorMessage: 'Ops! Não consegui encontrar uma imagem de raposa.' },
            '/auau': { handler: fetchDogImage, successMessage: 'Chat Bot: Auau? Isso é coisa de cachorro... Vou chamar...', errorMessage: 'Ops! Não consegui encontrar uma imagem de cachorro.', sound: playDogSound },
            '/usuario': { handler: fetchUserImage, successMessage: 'Chat Bot: Tome uma foto de usuário comum...', errorMessage: 'Ops! Não consegui encontrar uma imagem de usuário.' },
            '/som de gato': { handler: () => Promise.resolve(), successMessage: '', errorMessage: '', sound: playGatoSound },
            '/som de bode': { handler: () => Promise.resolve(), successMessage: '', errorMessage: '', sound: playBodeSound },
            '/star wars': { handler: () => Promise.resolve(), successMessage: 'Chat Bot: Que a força esteja com você...', errorMessage: '', sound: playStarWarsTheme }
        };

        const command = commands[commandMsg.toLowerCase()];
        if (command) {
            await handleCommand(socket, io, commandMsg, command.handler, command.successMessage, command.errorMessage, command.sound);
        }
    }
}

module.exports = {
    handleMessage
};