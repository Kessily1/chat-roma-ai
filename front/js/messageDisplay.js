// Exibir mensagens no chat
socket.on("message", (msg) => {
    const isCurrentUser = msg.startsWith(`${username}:`);
    const isBotMessage = msg.startsWith('Chat Bot:');
    displayMessage(msg, isBotMessage, isCurrentUser);
    scrollToBottom(); // Adiciona a função para rolar para a última mensagem
});

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

    if (isBot) {
        const botImage = document.createElement('img');
        botImage.src = 'https://img.icons8.com/?size=100&id=q7wteb2_yVxu&format=png&color=000000';
        botImage.alt = 'Bot';
        botImage.className = 'bot-image';
        messageDiv.appendChild(botImage);
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(message)) {
        const img = document.createElement('img');
        img.src = message.match(urlRegex)[0];
        img.alt = 'Imagem recebida';
        img.className = 'received-image';
        img.onload = () => scrollToBottom(); // Rola para o final após a imagem ser carregada
        messageDiv.appendChild(img);
    } else {
        messageDiv.appendChild(document.createTextNode(message));
    }

    ul.appendChild(messageDiv);
    scrollToBottom(); // Adiciona a função para rolar para a última mensagem
}

function scrollToBottom() {
    const messageBox = document.querySelector('.message-box');
    messageBox.scrollTop = messageBox.scrollHeight;
}
