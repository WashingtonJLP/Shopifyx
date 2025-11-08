// routes/produtos.js
const express = require('express');
const router = express.Router();
const Produto = require('../models/produto');
const { upload, cloudinary } = require('../config/upload');

//  Upload da imagem pro Cloudinary
router.post('/upload', upload.single('imagem'), (req, res) => {
  try {
    res.json({ imagem: req.file.path }); 
  } catch (err) {
    console.error('❌ Erro ao enviar imagem:', err);
    res.status(500).json({ erro: 'Erro ao enviar imagem.' });
  }
});

//  Criar produto
router.post('/', async (req, res) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.status(201).json({ message: 'Produto criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//  Listar produtos
router.get('/', async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//  Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//  Atualizar produto
router.put('/:id', async (req, res) => {
  try {
    await Produto.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Produto atualizado com sucesso!' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//  Deletar produto + imagem do Cloudinary
router.delete('/:id', async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (produto && produto.imagem) {
      const publicId = produto.imagem.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`produtos/${publicId}`);
    }
    await Produto.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produto deletado com sucesso!' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
