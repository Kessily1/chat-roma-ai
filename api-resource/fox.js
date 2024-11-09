
const axios = require('axios');

// /raposa - Função para buscar uma imagem de raposa 
async function fetchFoxImage() {
    const response = await axios.get('https://randomfox.ca/floof/');
    return response.data.image; // Retorna a URL da imagem da raposa
}

module.exports = {
    fetchFoxImage
};