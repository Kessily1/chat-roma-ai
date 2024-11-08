const axios = require('axios');

async function fetchFoxImage() {
    const response = await axios.get('https://randomfox.ca/floof/');
    return response.data.image; // Retorna a URL da imagem da raposa
}

module.exports = fetchFoxImage; // Exporta a função fetchFoxImage