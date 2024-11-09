
const axios = require('axios');

// /usuário - Função para buscar uma imagem de usuário
async function fetchUserImage() {
    const response = await axios.get('https://randomuser.me/api/');
    return response.data.results[0].picture.large; // Retorna a URL da imagem do usuário
}

module.exports = {
    fetchUserImage
};