// socketConfig.js
const socket = io("https://solid-funicular-jjqjvp5qw7gx3pw4w-3000.app.github.dev/");

if (!localStorage.getItem("username")) {
    window.location.href = "/front/login.html"; 
}

const username = localStorage.getItem("username") || "Usuário Anônimo";
let usuariosOnline = 0;

// Evento de conexão com o servidor
socket.on("connect", () => {
    console.log("Usuário conectado");
    usuariosOnline++;
    atualizarContagemOnline();
    socket.emit('setUsername', username);
    document.getElementById("meuNomeUsuario").textContent = username;
});

// Evento de desconexão com o servidor
socket.on("disconnect", () => {
    console.log("Usuário desconectado");
    usuariosOnline--;
    atualizarContagemOnline();
});

// Atualiza a contagem de usuários online
socket.on("usuariosOnline", (count) => {
    usuariosOnline = count;
    atualizarContagemOnline();
});

// Toca o áudio quando solicitado
socket.on('playAudio', (audioPath) => {
    const audio = document.getElementById('notificationSound');
    audio.src = audioPath; 
    console.log("caminho do audio:",audioPath);
    audio.play()
        .catch((error) => {
            console.error('Erro ao tentar reproduzir o áudio:', error);
        });
});
