const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const verifyToken = require('./verifyToken'); // Certifique-se de que essa função está implementada corretamente

module.exports = (upload, db) => {

  // Acessa a chave de API
  const apiKey = 'AIzaSyBVJmQC1FCnqb4vknJ9GPHHa2ZCVgF3Hng'; // Substitua pela sua chave de API
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: 'sempre responda no final da frase atenciosamente "jose"',
  });

  const chat = model.startChat();

  // Rota principal para mensagens (BOT e mensagens normais unificadas)
  router.post('/send-message', async (req, res) => {
    const { message, userId, userName, userColor, isImage } = req.body;
    const timestamp = Date.now();

    if (message.startsWith('/bot')) {
      try {
        // Remove o "/bot" e envia o restante como prompt para o Gemini
        const userPrompt = message.replace('/bot', '').trim();
        const result = await chat.sendMessage(userPrompt);
        const resultText = result.response.text();
        return res.status(200).json({ response: resultText });
        return res.status(200).json({ response: result.response.text() });
      } catch (error) {
        console.error('Erro ao gerar resposta do Gemini:', error);
        return res.status(500).json({ error: 'Erro ao gerar resposta do bot.' });
      }
    } else {
      // Mensagem normal: salvar no banco de dados
      const chatMessage = {
        userId,
        userName,
        userColor,
        message,
        isImage: isImage || false,
        timestamp,
      };

      if (req.file) {
        // Se houver um arquivo, adicioná-lo à mensagem
        chatMessage.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          filename: req.file.originalname
        };
      }

      db.ref("messages").push(chatMessage)
        .then(() => res.status(200).json({ message: "Message sent successfully" }))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  });

  // Endpoint para obter mensagens
  router.get('/get-messages', verifyToken, (req, res) => {
    db.ref("messages").once('value')
      .then(snapshot => res.status(200).json(snapshot.val()))
      .catch(error => res.status(500).json({ error: error.message }));
  });

  // Endpoint para executar código Python
  router.post('/execute-python', (req, res) => {
    const code = req.body.code;
    console.log('Received Python code:', code); // Log do código recebido

    let options = {
      mode: 'text',
      pythonOptions: ['-c'],
      args: [code]
    };

    PythonShell.runString(code, options, function (err, results) {
      if (err) {
        console.error('Error executing Python code:', err); // Log detalhado do erro
        return res.status(500).json({ error: err.message });
      }
      console.log('Python output:', results); // Log da saída do Python
      if (results) {
        res.status(200).json({ output: results.join('\n') });
      } else {
        res.status(200).json({ output: 'No output from Python code' });
      }
    });
  });

  return router;
};
