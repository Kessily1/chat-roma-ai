function playLoginAudio(socket) {
    const login_audio = '../audio/easychatlogin.mp3';
    socket.emit('playAudio', login_audio);
}

function playNewMessageAudio(socket) {
    const newMessageAudio = '../audio/newmessage.mp3';
    socket.emit('playAudio', newMessageAudio);
}

function playErrorAudio(socket) {
    const audioErro = '../audio/risoErro.wav';
    socket.emit('playAudio', audioErro);
}

function playCatSound(socket) {
    const somGato = '../audio/somGatoMiau.wav';
    socket.emit('playAudio', somGato);
}

function playDogSound(socket) {
    const somDogAuau = '../audio/somDogAuau.wav';
    socket.emit('playAudio', somDogAuau);
}

function playGatoSound(socket) {
    const gato = '../audio/somGato.wav';
    socket.emit('playAudio', gato);
}

function playBodeSound(socket) {
    const bode = '../audio/somBode.wav';
    socket.emit('playAudio', bode);
}

function playStarWarsTheme(socket) {
    const starWars = '../audio/starWarsTheme.mp3';
    socket.emit('playAudio', starWars);
}

module.exports = {
    playLoginAudio,
    playNewMessageAudio,
    playErrorAudio,
    playCatSound,
    playDogSound,
    playGatoSound,
    playBodeSound,
    playStarWarsTheme
};