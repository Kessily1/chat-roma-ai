// Atualizar contagem de usuários online
function atualizarContagemOnline() {
    document.getElementById('online').textContent = usuariosOnline;
}

// Receber contagem de usuários online
socket.on("usuariosOnline", (count) => {
    usuariosOnline = count;
    atualizarContagemOnline();
});
