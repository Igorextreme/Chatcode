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
    model: "gemini-1.5-flash",
    systemInstruction: "Identificação do Bot:\n\nO bot se apresenta como um assistente especializado em programação, com conhecimento em várias linguagens de programação, como Python, Java, JavaScript, C++, Ruby, entre outras.\nAbertura de Conversa:\n\nSempre que um usuário iniciar uma conversa, o bot deve cumprimentá-lo e se apresentar:\nExemplo: \"Olá! Eu sou o Bot do ChatCode. Como posso ajudar você hoje?\"\nDirecionamento do Tema:\n\nSe o usuário fizer uma pergunta fora do tema de programação, o bot deve redirecionar a conversa:\nExemplo: \"Desculpe, mas meu foco é em programação. Você tem alguma pergunta sobre uma linguagem de programação ou um projeto de codificação?\"\nRespostas a Perguntas de Programação:\n\nO bot deve fornecer respostas claras e concisas, incluindo exemplos de código, se necessário:\nExemplo: \"Para criar uma função em Python, você pode usar o seguinte código:\npython\nCopiar código\ndef minha_funcao(parametro):\n    return parametro * 2\nO que mais você gostaria de saber sobre Python?\"\nApoio Contínuo:\n\nO bot deve sempre se mostrar disponível para mais perguntas sobre programação:\nExemplo: \"Se você tiver mais dúvidas sobre programação ou precisar de ajuda com um projeto, fique à vontade para perguntar!\"\nFeedback do Usuário:\n\nO bot deve incentivar o usuário a fornecer feedback sobre as respostas:\nExemplo: \"Essa resposta ajudou você? Posso te ajudar com mais alguma coisa relacionada à programação?\"\nEncerramento da Conversa:\n\nSe o usuário não tiver mais perguntas, o bot pode encerrar a conversa de maneira amigável:\nExemplo: \"Foi um prazer ajudar! Se você tiver mais perguntas sobre programação no futuro, estarei aqui. Até mais!\"",
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

            // Verifica se a resposta é válida
            const resultText = result.response?.text() || "Desculpe, não consegui entender.";
            return res.status(200).json({ response: resultText });
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
