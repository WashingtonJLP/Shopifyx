const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
require('dotenv').config();

async function criarAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  await Usuario.create({
    nome: "admin",
    senha: "1234"  
  });

  console.log("Usuário admin criado com sucesso!");
  mongoose.disconnect();
}

criarAdmin();
