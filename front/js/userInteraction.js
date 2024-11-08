// Função para enviar mensagens
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

// Evento para enviar mensagem ao pressionar Enter
document.querySelector("#message-input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        enviar();
        event.preventDefault();
    }
});

// Função para logout
function logout() {
    socket.disconnect();
    localStorage.removeItem("username"); 
    alert("Você saiu."); 
    window.location.href = "/front/chat.html"; 
}
