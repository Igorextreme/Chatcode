// Importações
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db } = require('./firebaseConfig'); // Certifique-se de que sua configuração do Firebase está correta
const routes = require('./routes'); // Importe suas rotas conforme a necessidade

// Importar a biblioteca do Google Generative AI
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

// Definir a chave da API Gemini
const apiKey = "AIzaSyBVJmQC1FCnqb4vknJ9GPHHa2ZCVgF3Hng"; // Substitua por sua chave de API
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Identificação do Bot:\n\nO bot se apresenta como um assistente especializado em programação, com conhecimento em várias linguagens de programação, como Python, Java, JavaScript, C++, Ruby, entre outras.",
});



// Função para enviar a mensagem ao Gemini e receber a resposta
async function getBotResponse(userMessage) {
  try {
    const chatSession = await model.startChat({
      generationConfig,
      history: [{ user: userMessage }],
    });

    const result = await chatSession.sendMessage(userMessage);
    if (result && result.response) {
      return result.response.text; // Retorna a resposta do bot
    } else {
      return "Nenhuma resposta foi recebida do bot.";
    }
  } catch (error) {
    console.error("Erro ao obter resposta do Gemini:", error);
    return "Desculpe, não consegui processar sua pergunta no momento.";
  }
}

// Inicializar o app Express
const app = express();

// Middleware para logar todas as conexões
app.use((req, res, next) => {
  console.log(`Client connected: ${req.ip} - ${new Date().toISOString()}`);
  next();
});

// Use o middleware cors
app.use(cors());

// Middleware para aumentar o limite de carga útil
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Rotas
app.use('/api', routes);

// Rota para limpar todas as mensagens
app.post('/clearall', (req, res) => {
  db.ref('messages').remove()
    .then(() => {
      res.status(200).send({ message: 'All messages cleared!' });
    })
    .catch((error) => {
      console.error('Error clearing messages:', error);
      res.status(500).send({ error: 'Failed to clear messages' });
    });
});

// Endpoint para interagir com o bot do Gemini
app.post('/api/bot/message', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).send({ error: 'No message provided' });
  }

  try {
    const botResponse = await getBotResponse(message);
    res.status(200).send({ response: botResponse });
  } catch (error) {
    console.error('Erro ao processar mensagem do bot:', error);
    res.status(500).send({ error: 'Erro ao obter resposta do bot' });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
