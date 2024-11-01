//
// *** Atenção: Para testes verifique seu Link e insira no SOCKET abaixo:
//
const socket = io("https://haunted-mummy-97j7rg9j4xggc79j9-3000.app.github.dev/
    ");

if (!localStorage.getItem("username")) {
    window.location.href = "login.html"; 
}

const username = localStorage.getItem("username") || "Usuário Anônimo";
let usuariosOnline = 0;

socket.on('userStatus', (statusMessage) => {
    mostrarPopup(statusMessage);
});

socket.on("connect", () => {
    console.log("Usuário conectado");
    usuariosOnline++;
    atualizarContagemOnline();
    socket.emit('setUsername', username);
});

socket.on("disconnect", () => {
    console.log("Usuário desconectado");
    usuariosOnline--;
    atualizarContagemOnline();
});

socket.on("usuariosOnline", (count) => {
    usuariosOnline = count;
    atualizarContagemOnline();
});

// Tratando mensagens aqui:
socket.on("message", (msg) => {
    const ul = document.querySelector("ul");
    const isCurrentUser = msg.startsWith(`${username}:`);
    displayMessage(msg, !isCurrentUser);
});

// Função para exibir mensagens
function displayMessage(message, isBot = false) {
    const ul = document.querySelector("ul");
    
    // Cria um elemento de mensagem
    const messageDiv = document.createElement('li');
    messageDiv.className = isBot ? 'message received' : 'message sent';

    // Adiciona figura do BOT:
    if (isBot) {
        const botImage = document.createElement('img');
        botImage.src = 'https://img.icons8.com/?size=100&id=q7wteb2_yVxu&format=png&color=000000'; 
        botImage.alt = 'Bot'; 
        botImage.className = 'bot-image'; 
        messageDiv.appendChild(botImage); 
    }

    // Adiciona o conteúdo da mensagem:
    messageDiv.appendChild(document.createTextNode(message));
    
    // Adiciona a mensagem ao chat:
    ul.appendChild(messageDiv);

    // Rola automaticamente para a última mensagem
    const messageBox = document.querySelector('.message-box');
    messageBox.scrollTop = messageBox.scrollHeight; // Rola para baixo
}

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
        errorMessage.textContent = "Mensagem vazia não pode ser enviada.";
    }
}

document.querySelector("#message-input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        enviar();
        event.preventDefault();
    }
});

function logout() {
    localStorage.removeItem("username"); 
    alert("Você saiu."); 
    window.location.href = "login.html"; 
}

function atualizarContagemOnline() {
    document.getElementById('online').textContent = usuariosOnline;
}

function mostrarPopup(mensagem) {
    document.getElementById('popup-message').textContent = mensagem;
    document.getElementById('popup').style.display = 'flex';
    setTimeout(fecharPopup, 3000);
}

function fecharPopup() {
    document.getElementById('popup').style.display = 'none';
}
