const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { db } = require('./firebaseConfig');
const routes = require('./routes');
const PORT = process.env.PORT || 3001;

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

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
