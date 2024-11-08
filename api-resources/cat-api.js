const axios = require('axios');

async function fetchCatImage() {
    const response = await axios.get('https://api.thecatapi.com/v1/images/search');
    return response.data[0].url; // Retorna a URL da imagem do gato
}

module.exports = fetchCatImage;
