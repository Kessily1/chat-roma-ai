const axios = require('axios');

async function fetchDogImage() {
    const response = await axios.get('https://random.dog/woof.json');
    return response.data.url; // Retorna a URL da imagem do cachorro
}

module.exports = fetchDogImage;
