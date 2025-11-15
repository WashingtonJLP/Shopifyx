// routes/produtos.js
const express = require('express');
const router = express.Router();
const Produto = require('../models/produto');
const auth = require('../middleware/authMiddleware');  // ⬅ middleware de autenticação
const { upload, cloudinary } = require('../config/upload');

// ===========================
// UPLOAD (PRECISA DE TOKEN)
// ===========================
router.post('/upload', auth, upload.single('imagem'), (req, res) => {
  try {
    res.json({ imagem: req.file.path });
  } catch (err) {
    console.error('❌ Erro ao enviar imagem:', err);
    res.status(500).json({ erro: 'Erro ao enviar imagem.' });
  }
});

// ===========================
// CRIAR PRODUTO (ADMIN)
// ===========================
router.post('/', auth, async (req, res) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.status(201).json({ message: 'Produto criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===========================
// LISTAR PRODUTOS (PÚBLICO)
// ===========================
router.get('/', async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===========================
// BUSCAR POR ID (PÚBLICO)
// ===========================
router.get('/:id', async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===========================
// ATUALIZAR PRODUTO (ADMIN)
// ===========================
router.put('/:id', auth, async (req, res) => {
  try {
    await Produto.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Produto atualizado com sucesso!' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===========================
// DELETAR PRODUTO (ADMIN)
// ===========================
router.delete('/:id', auth, async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    // Apagar imagem do Cloudinary
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
