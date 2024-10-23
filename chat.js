//const socket = io("SEU LINK");

//LINK DO MEU CODESPACE
const socket = io("https://literate-space-computing-machine-g45g7999w57jf96v7-3000.app.github.dev/");

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

socket.on("message", (msg) => {
    const ul = document.querySelector("ul");
    const isCurrentUser = msg.startsWith(`${username}:`);
    const messageClass = isCurrentUser ? 'sent' : 'received';
    ul.innerHTML += `<li class="message ${messageClass}">${msg}</li>`;
});

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
