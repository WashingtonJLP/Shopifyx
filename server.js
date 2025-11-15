const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const produtosRoutes = require('./routes/produtos');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(express.static('public'));

// Rotas
app.use('/auth', authRoutes);     
app.use('/produtos', produtosRoutes);

// Conectar MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
  .catch(err => console.error('❌ Erro de conexão:', err));

// Subir servidor
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Servidor rodando na porta ${port}`));
