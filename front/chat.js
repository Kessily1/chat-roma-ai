// * Atenção: Para testes verifique seu Link e insira no SOCKET abaixo:
//
const socket = io("https://haunted-mummy-97j7rg9j4xggc79j9-3000.app.github.dev/");
//
//

if (!localStorage.getItem("username")) {
    window.location.href = "/front/login.html"; 
}

const username = localStorage.getItem("username") || "Usuário Anônimo";
let usuariosOnline = 0;

// Eventos do socket
socket.on('userStatus', mostrarPopup);

socket.on("usuariosOnline", (count) => {
    usuariosOnline = count;
    atualizarContagemOnline();
});

socket.on("connect", () => {
    console.log("Usuário conectado");
    usuariosOnline++;
    atualizarContagemOnline();
    socket.emit('setUsername', username);
    document.getElementById("meuNomeUsuario").textContent = username;
});

socket.on("disconnect", () => {
    console.log("Usuário desconectado");
    usuariosOnline--;
    atualizarContagemOnline();
});
    
    // Tratando mensagens:
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

        // Adiciona figura do BOT, se for uma mensagem do bot:
        if (isBot) {
            const botImage = document.createElement('img');
            botImage.src = 'https://img.icons8.com/?size=100&id=q7wteb2_yVxu&format=png&color=000000'; 
            botImage.alt = 'Bot'; 
            botImage.className = 'bot-image'; 
            messageDiv.appendChild(botImage); 
        }
        
    // Verifica se a mensagem é uma URL:
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Regex para identificar URLs
    if (urlRegex.test(message)) {
        const img = document.createElement('img');
        img.src = message.match(urlRegex)[0]; // Pega a primeira URL encontrada
        img.alt = 'Imagem recebida';
        img.className = 'received-image'; // Classe CSS para estilizar a imagem
        messageDiv.appendChild(img);
    } else {
        // Adiciona o conteúdo da mensagem
        messageDiv.appendChild(document.createTextNode(message));
    }

    // Adiciona a mensagem ao chat:
    ul.appendChild(messageDiv);

    // Rola automaticamente para a última mensagem:
    const messageBox = document.querySelector('.message-box');
    messageBox.scrollTop = messageBox.scrollHeight; // Rola para baixo
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

// Função para logout
function logout() {
    localStorage.removeItem("username"); 
    alert("Você saiu."); 
    window.location.href = "/front/login.html"; 
}

// Função para contagem de usuários online:
function atualizarContagemOnline() {
    document.getElementById('online').textContent = usuariosOnline;
}

// Função para mostra popup de status (entrada/saida) do chat:
function mostrarPopup(mensagem) {
    document.getElementById('popup-message').textContent = mensagem;
    document.getElementById('popup').style.display = 'flex';
    setTimeout(fecharPopup, 3000);
}

// Função para fechar popup:
function fecharPopup() {
    document.getElementById('popup').style.display = 'none';
}
