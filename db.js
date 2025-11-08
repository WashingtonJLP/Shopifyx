// db.js
const mongoose = require('mongoose');
require('dotenv').config();

async function conectarMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao conectar no MongoDB:', err);
  }
}

module.exports = conectarMongo;
