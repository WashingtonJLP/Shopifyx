const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const produtosRoutes = require('./routes/produtos');

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.use('/produtos', produtosRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
  .catch(err => console.error('❌ Erro de conexão:', err));

app.listen(3000, () => console.log('🚀 Servidor rodando na porta 3000'));
