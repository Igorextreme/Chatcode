const express = require('express');
const router = express.Router();

module.exports = (upload, db) => {
  
  // Endpoint para enviar mensagem
  router.post('/send-message', upload.single('image'), (req, res) => {
    const { userId, userName, userColor, content, isImage } = req.body;
    const message = {
      userId,
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
  router.get('/get-messages', (req, res) => {
    db.ref("messages").once('value')
      .then(snapshot => res.status(200).json(snapshot.val()))
      .catch(error => res.status(500).json({ error: error.message }));
  });

  return router;
};
