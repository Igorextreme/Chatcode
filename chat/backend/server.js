const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { db } = require('./firebaseConfig');
const routes = require('./routes');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3001;

// Importar a biblioteca do Google Generative AI
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

// Definir a chave da API Gemini
const apiKey = "AIzaSyBVJmQC1FCnqb4vknJ9GPHHa2ZCVgF3Hng";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Identificação do Bot:\n\nO bot se apresenta como um assistente especializado em programação, com conhecimento em várias linguagens de programação, como Python, Java, JavaScript, C++, Ruby, entre outras.",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Função para enviar a mensagem ao Gemini e receber a resposta
async function getBotResponse(userMessage) {
  const chatSession = model.startChat({
    generationConfig,
    history: [{ user: userMessage }],
  });

  try {
    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();
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

// Configurar multer para uploads de arquivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } }); // Limite de 50MB

// Rotas
app.use('/api', routes(upload, db));

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
