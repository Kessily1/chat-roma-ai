const axios = require('axios');
require('dotenv').config(); // Carrega as variáveis de ambiente

// Função para chamar a API da OpenAI para texto
async function generateOpenAIResponse(message) {
    console.log('Chamando a API da OpenAI com a mensagem:', message);
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Erro ao chamar a API da OpenAI:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Função para chamar a API da OpenAI para imagens
async function generateOpenAIImage(description) {
    console.log('Chamando a API da OpenAI para gerar imagem com a descrição:', description);
    try {
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            prompt: description,
            n: 1,
            size: '1024x1024',
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.data[0].url;
    } catch (error) {
        console.error('Erro ao chamar a API da OpenAI para gerar imagem:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Função para buscar uma imagem de gato 
async function fetchCatImage() {
    const response = await axios.get('https://api.thecatapi.com/v1/images/search');
    return response.data[0].url; // Retorna a URL da imagem do gato
}

// Função para buscar uma imagem de raposa 
async function fetchFoxImage() {
    const response = await axios.get('https://randomfox.ca/floof/');
    return response.data.image; // Retorna a URL da imagem da raposa
}

// Função para buscar uma imagem de cachorro 
async function fetchDogImage() {
    const response = await axios.get('https://random.dog/woof.json');
    return response.data.url; // Retorna a URL da imagem do cachorro
}

// Função para buscar uma imagem de usuário
async function fetchUserImage() {
    const response = await axios.get('https://randomuser.me/api/');
    return response.data.results[0].picture.large; // Retorna a URL da imagem do usuário
}

module.exports = {
    generateOpenAIResponse,
    generateOpenAIImage,
    fetchCatImage,
    fetchFoxImage,
    fetchDogImage,
    fetchUserImage
};