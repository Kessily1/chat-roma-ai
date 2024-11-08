const socket = io();

if (!localStorage.getItem("username")) {
    window.location.href = "../login.html"; 
}

const username = localStorage.getItem("username") || "Usuário Anônimo";
let usuariosOnline = 0;

// Eventos do socket

// Apresentação de Popup:
socket.on('userStatus', mostrarPopup);

// Usuarios On Line:
socket.on("usuariosOnline", (count) => {
    usuariosOnline = count;
    atualizarContagemOnline();
});

// Evento de conexão com servidor:
socket.on("connect", () => {
    console.log("Usuário conectado");
    usuariosOnline++;
    atualizarContagemOnline();
    socket.emit('setUsername', username);
    document.getElementById("meuNomeUsuario").textContent = username;
});

// Tocar os audios aqui:
socket.on('playAudio', (audioPath) => {
    const audio = document.getElementById('notificationSound');
    audio.src = audioPath; 
    console.log("caminho do audio:",audioPath);
    audio.play()
        .catch((error) => {
            console.error('Erro ao tentar reproduzir o áudio:', error);
        });
});

// Encerrar conexão com servidor:
socket.on("disconnect", () => {
    console.log("Usuário desconectado");
    usuariosOnline--;
    atualizarContagemOnline();
});
    
// Tratando mensagens: Identificando mensagem do usuário e mensagem do Chat bot
socket.on("message", (msg) => {
    const isCurrentUser = msg.startsWith(`${username}:`); 
    const isBotMessage = msg.startsWith('Chat Bot:'); 
    
    // Chama displayMessage com a verificação correta:
    displayMessage(msg, isBotMessage, isCurrentUser);
});

// Função para exibir mensagens: (displayMessage)
function displayMessage(message, isBot, isUser) {
    const ul = document.querySelector("ul");
    const messageDiv = document.createElement('li');
    if (isBot) {
        messageDiv.className = 'message chatbot';
    } else if (isUser) {
        messageDiv.className = 'message sent';
    } else {
        messageDiv.className = 'message received';
    }

    // Adiciona figura do Bot "robô" na mensagem, se for uma mensagem do bot:
    if (isBot) {
        const botImage = document.createElement('img');
        botImage.src = 'https://img.icons8.com/?size=100&id=q7wteb2_yVxu&format=png&color=000000'; 
        botImage.alt = 'Bot'; 
        botImage.className = 'bot-image'; 
        messageDiv.appendChild(botImage); 
    }
    
    // Verifica se a mensagem é uma URL:
    const urlRegex = /(https?:\/\/[^\s]+)/g; 
    if (urlRegex.test(message)) {
        const img = document.createElement('img');
        img.src = message.match(urlRegex)[0]; 
        img.alt = 'Imagem recebida';
        img.className = 'received-image'; 
        messageDiv.appendChild(img);
    } else {
        // Adiciona o conteúdo da mensagem caso não seja uma URL:
        messageDiv.appendChild(document.createTextNode(message));
    }

    // Adiciona a mensagem ao chat:
    ul.appendChild(messageDiv);

    // Rola automaticamente para a última mensagem: (Rolagem de tela)
    const messageBox = document.querySelector('.message-box');
    messageBox.scrollTop = messageBox.scrollHeight; 
}

// Função para enviar mensagens (usuario):
function enviar() {
    const msgInput = document.querySelector("#message-input");
    const msg = msgInput.value.trim();
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = "";
    if (msg) {
        const messageWithUsername = `${username}: ${msg}`;
        socket.emit("message", messageWithUsername);
        msgInput.value = "";
    } else {
        errorMessage.textContent = "Ops! Mensagem vazia não pode ser enviada.";
    }
}

// Adiciona evento para enviar mensagem ao pressionar Enter:
document.querySelector("#message-input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        enviar();
        event.preventDefault();
    }
});

// Função para logout:
function logout() {
    socket.disconnect();
    localStorage.removeItem("username"); 
    alert("Você saiu."); 
    window.location.href = "/front/login.html"; 
}

// Função para contagem de usuários online:
function atualizarContagemOnline() {
    document.getElementById('online').textContent = usuariosOnline;
}

// Função para mostra Poppup de status (entrada/saida) do chat:
function mostrarPopup(mensagem) {
    document.getElementById('popup-message').textContent = mensagem;
    document.getElementById('popup').style.display = 'flex';
    setTimeout(fecharPopup, 3000); // <-- Tempo em que janela Popup fica aberta
}

// Função para fechar popup:
function fecharPopup() {
    document.getElementById('popup').style.display = 'none';
}
