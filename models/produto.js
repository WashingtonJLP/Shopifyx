// models/Produto.js
const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  codigo: { type: String, required: true, unique: true },
  preco: { type: Number, required: true },
  descricao: { type: String },
  quantidade: { type: Number, default: 0 },
  avaliacao: { type: Number, default: 0 },
  categoria: { type: String },
  imagem: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Produto', produtoSchema);
