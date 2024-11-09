function handleSetUsername(socket, user, usuarios, usuariosOnline, io) {
    if (!user || Object.values(usuarios).includes(user)) {
        socket.emit('userStatus', 'Eita! Nome de usuário inválido ou já em uso.');
        return;
    }
    usuarios[socket.id] = user;
    usuariosOnline++;   
    io.emit('usuariosOnline', usuariosOnline);
    io.emit('userStatus', `${user} entrou no chat`);    
}

function handleDisconnect(socket, usuarios, usuariosOnline, io) {
    const user = usuarios[socket.id];
    console.log('Usuário desconectado: ' + socket.id);
    if (user) {
        usuariosOnline--;
        delete usuarios[socket.id];
        io.emit('usuariosOnline', usuariosOnline);
        io.emit('userStatus', `${user} saiu do chat`);
    }
}

module.exports = {
    handleSetUsername,
    handleDisconnect
};