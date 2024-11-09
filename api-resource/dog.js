
const axios = require('axios');

// /auau - Função para buscar uma imagem de cachorro 
async function fetchDogImage() {
    const response = await axios.get('https://random.dog/woof.json');
    return response.data.url; // Retorna a URL da imagem do cachorro
}

module.exports = {
    fetchDogImage
};