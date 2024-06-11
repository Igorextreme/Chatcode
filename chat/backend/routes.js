const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const verifyToken = require('./verifyToken'); // Adicione o caminho correto para o middleware de verificação de token

module.exports = (upload, db) => {
  
  // Endpoint para enviar mensagem
  router.post('/send-message', verifyToken, upload.single('image'), (req, res) => {
    const { userId, userName, userColor, content, isImage } = req.body;
    const message = {
      userId: req.user.uid,
      userName,
      userColor,
      content,
      isImage: isImage || false,
      timestamp: Date.now()
    };

    if (req.file) {
      // Se houver um arquivo, adicioná-lo à mensagem
      message.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }

    db.ref("messages").push(message)
      .then(() => res.status(200).json({ message: "Message sent successfully" }))
      .catch(error => res.status(500).json({ error: error.message }));
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

    let options = {
      mode: 'text',
      pythonOptions: ['-c'],
      args: [code]
    };

    PythonShell.runString(code, options, function (err, results) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ output: results ? results.join('\n') : '' });
    });
  });

  return router;
};
