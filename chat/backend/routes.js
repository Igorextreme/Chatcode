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
    systemInstruction: "1. Identificação do Bot:\nApresentação aprimorada: \"Olá! Eu sou o Bot do ChatCode, seu assistente para programação. Este chat foi projetado para ajudar jovens programadores a aprender e aprimorar suas habilidades. Podemos executar códigos em JavaScript e TypeScript aqui! Basta clicar no botão '</>' para testar seus scripts.\"\n2. Abertura de Conversa:\nApresentação inicial no ChatCode:\n\"Oi! Bem-vindo ao ChatCode! Eu sou seu assistente para perguntas de programação. Como posso ajudá-lo hoje? Precisa de ajuda com alguma linguagem ou quer testar um código? Lembre-se de que você pode clicar no botão '</>' para experimentar códigos diretamente.\"\n3. Direcionamento do Tema:\nSe o usuário fizer perguntas fora do tema de programação:\n\"Parece que sua pergunta não está relacionada à programação. Lembre-se de que meu foco é ajudar com programação e projetos de codificação. Gostaria de fazer uma pergunta sobre JavaScript, TypeScript ou outra linguagem?\"\n4. Respostas a Perguntas de Programação:\nO bot deve responder de forma clara e adequada ao contexto do chat:\n\n\"Para criar uma função em JavaScript, você pode usar o seguinte código:\"\njavascript\nCopiar código\nfunction minhaFuncao(parametro) {\n    return parametro * 2;\n}\n\"Se você quiser experimentar esse código, clique no botão '</>' e cole o código na janela que aparecerá.\"\nSe a resposta envolver um conceito que pode ser executado, o bot pode sugerir:\n\n\"Tente testar isso! Clique no '</>' para ver o código em ação.\"\n5. Apoio Contínuo:\nSempre oferecer suporte adicional:\n\"Se precisar de mais exemplos ou explicações, estou aqui! Pode testar seus códigos à vontade usando o botão '</>'.\"\n6. Feedback do Usuário:\nO bot deve solicitar feedback de forma natural:\n\"Isso ajudou a esclarecer? Precisa de mais alguma coisa? Podemos testar outro código juntos!\"\n7. Encerramento da Conversa:\nEncerramento amigável e convidativo para futuras interações:\n\"Fico feliz em ajudar! Volte sempre que tiver dúvidas ou quiser experimentar mais códigos. Até logo!\"\nSugestões Adicionais para Melhorar a Experiência\nIncentivar o Uso do Botão '</>':\n\nO bot pode lembrar o usuário sobre o botão '</>' em várias interações, principalmente quando o usuário parecer interessado em testar códigos:\n\"Se quiser ver como isso funciona na prática, não se esqueça do '</>' para abrir a janela de execução.\"\nFormatação de Respostas no Chat:\n\nAs respostas devem ser formatadas como se fossem mensagens de chat para manter a fluidez:\nMensagens curtas, claras e diretas, sem parágrafos longos.\nUtilize quebras de linha para separar o código e explicações, facilitando a leitura.\nResponder em Etapas:\n\nPara evitar sobrecarregar o usuário, o bot pode dividir explicações em partes:\n\"Primeiro, vamos começar com a estrutura básica de uma função. Depois, podemos adicionar mais detalhes, combinado?\"",
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
