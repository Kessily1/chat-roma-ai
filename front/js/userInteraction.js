// Função para enviar mensagens
function enviar() {
    const msgInput = document.querySelector("#message-input");
    const msg = msgInput.value.trim(); // Remover espaços em branco extras
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = ""; // Limpar mensagens de erro

    if (msg) {
        const messageWithUsername = `${username}: ${msg}`; // Adicionar o nome de usuário à mensagem
        socket.emit("message", messageWithUsername); // Emitir a mensagem para o servidor
        msgInput.value = ""; // Limpar o campo de input após enviar
    } else {
        errorMessage.textContent = "Ops! Mensagem vazia não pode ser enviada."; // Mensagem de erro
    }
}

// Evento para enviar mensagem ao pressionar Enter
document.querySelector("#message-input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        enviar(); // Enviar mensagem quando a tecla Enter for pressionada
        event.preventDefault(); // Impedir o comportamento padrão do Enter (pular linha)
    }
});

// Função para logout
function logout() {
    socket.disconnect(); // Desconectar do servidor WebSocket
    localStorage.removeItem("username"); // Remover o nome de usuário do localStorage
    alert("Você saiu."); // Exibir alerta de saída
    window.location.href = "/front/chat.html"; // Redirecionar para a página de login
}

// Mostrar alerta personalizada
function mostrarAlerta(mensagem) {
    const alertBox = document.getElementById('alert-box');
    const alertMessage = document.getElementById('alert-message');

    alertMessage.textContent = mensagem; // Definir a mensagem do alerta
    alertBox.style.display = 'block'; // Exibir a caixa de alerta

    // Após 5 segundos, esconder o alerta
    setTimeout(() => {
        alertBox.style.display = 'none'; // Esconder a caixa de alerta após 5 segundos
    }, 5000); // 5000 ms = 5 segundos
}

// Fechar o alerta personalizado
function fecharAlerta() {
    document.getElementById('alert-box').style.display = 'none'; // Esconder a caixa de alerta
}

// Evento para mostrar alerta quando um usuário entra/sai
socket.on('userStatus', mostrarAlerta);
