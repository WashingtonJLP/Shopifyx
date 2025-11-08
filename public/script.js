const API_URL = 'http://localhost:3000/produtos';
const modalForm = new bootstrap.Modal(document.getElementById('modalForm'));
const modalDetalhes = new bootstrap.Modal(document.getElementById('modalDetalhes'));

let editandoId = null;

// Carrega produtos do backend 
async function carregarProdutos() {
  try {
    const res = await fetch('/produtos');
    if (!res.ok) throw new Error('Erro ao buscar produtos');

    const produtos = await res.json();
    const produtosContainer = document.getElementById('produtosContainer');
    produtosContainer.innerHTML = '';

    produtos.slice(-12).forEach(p => {
      produtosContainer.innerHTML += `
        <div class="col-md-3 mb-3">
          <div class="card h-100 shadow-sm">
            <img src="${p.imagem || 'https://via.placeholder.com/300'}" 
                 class="card-img-top" alt="${p.nome}">
            <div class="card-body">
              <h5 class="card-title">${p.nome}</h5>

              <!-- Código do produto -->
              <p class="text-muted mb-1">
                <small>Código: ${p.codigo || '—'}</small>
              </p>

              <!-- Descrição resumida -->
              <p class="mb-2">
                ${p.descricao
          ? p.descricao.length > 60
            ? p.descricao.substring(0, 60) + '...'
            : p.descricao
          : 'Sem descrição.'}
              </p>
              <!-- Informações principais -->
              <p class="mb-1"><strong>Preço:</strong> R$ ${p.preco ? p.preco.toFixed(2) : '0.00'}</p>
              <p class="mb-1"><strong>Quantidade:</strong> ${p.quantidade ?? '—'}</p>
              <p class="mb-1"><strong>Avaliação:</strong> ⭐ ${p.avaliacao ?? '—'}</p>
              <p class="mb-2"><strong>Categoria:</strong> ${p.categoria || '—'}</p>
              <button class="btn btn-outline-primary w-100" onclick="verDetalhes('${p._id}')">Detalhes
              </button>
            </div>
          </div>
        </div>`;
    });
  } catch (erro) {
    console.error('Erro ao carregar produtos:', erro);
  }
}
//  MOSTRAR DETALHES
async function verDetalhes(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao carregar detalhes');
    const produto = await res.json();

    document.getElementById('detalheNome').textContent = produto.nome;
    document.getElementById('detalheDescricao').textContent = produto.descricao || 'Sem descrição.';
    document.getElementById('detalhePreco').textContent = produto.preco.toFixed(2);
    document.getElementById('detalheImagem').src = produto.imagem || 'https://via.placeholder.com/400';

    document.getElementById('editarBtn').onclick = () => editarProduto(produto);
    document.getElementById('excluirBtn').onclick = () => excluirProduto(produto._id);

    modalDetalhes.show();
  } catch (erro) {
    console.error('Erro ao carregar detalhes:', erro);
  }
}

// NOVO PRODUTO
function novoProduto() {
  document.getElementById('formProduto').reset();
  document.getElementById('modalTitle').textContent = 'Novo Produto';
  editandoId = null;
  modalForm.show();
}

// SALVAR PRODUTO (NOVO OU EDIÇÃO)
document.getElementById('formProduto').addEventListener('submit', async (e) => {
  e.preventDefault();

  let imagemUrl = '';
  const imagemInput = document.getElementById('imagem');

  // Se o usuário enviou uma imagem, faz upload pro Cloudinary
  if (imagemInput && imagemInput.files.length > 0) {
    const formData = new FormData();
    formData.append('imagem', imagemInput.files[0]);

    const uploadRes = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    const uploadData = await uploadRes.json();
    imagemUrl = uploadData.imagem;
  }

  const produto = {
    nome: document.getElementById('nome').value,
    codigo: document.getElementById('codigo').value,
    preco: parseFloat(document.getElementById('preco').value),
    descricao: document.getElementById('descricao').value,
    quantidade: parseInt(document.getElementById('quantidade').value),
    avaliacao: parseFloat(document.getElementById('avaliacao').value),
    categoria: document.getElementById('categoria').value,
    imagem: imagemUrl || (editandoId ? document.getElementById('imagem').dataset.atual : '')
  };

  try {
    const metodo = editandoId ? 'PUT' : 'POST';
    const url = editandoId ? `${API_URL}/${editandoId}` : API_URL;

    const res = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produto)
    });

    if (!res.ok) throw new Error('Erro ao salvar produto');

    modalForm.hide();
    carregarProdutos();
  } catch (erro) {
    console.error('Erro ao salvar produto:', erro);
  }
});

//  EDITAR PRODUTO
function editarProduto(produto) {
  editandoId = produto._id;
  document.getElementById('modalTitle').textContent = 'Editar Produto';
  document.getElementById('nome').value = produto.nome;
  document.getElementById('codigo').value = produto.codigo;
  document.getElementById('preco').value = produto.preco;
  document.getElementById('descricao').value = produto.descricao;
  document.getElementById('quantidade').value = produto.quantidade;
  document.getElementById('avaliacao').value = produto.avaliacao;
  document.getElementById('categoria').value = produto.categoria;

  // salva o link atual da imagem para manter caso não envie outra
  document.getElementById('imagem').dataset.atual = produto.imagem;

  modalDetalhes.hide();
  modalForm.show();
}

// ✅ EXCLUIR PRODUTO
async function excluirProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir produto');
    modalDetalhes.hide();
    carregarProdutos();
  } catch (erro) {
    console.error('Erro ao excluir produto:', erro);
  }
}

// 🔍 BUSCAR PRODUTO
async function buscarProduto(event) {
  event.preventDefault();
  const termo = document.getElementById('campoBusca').value.trim().toLowerCase();
  const res = await fetch(API_URL);
  const produtos = await res.json();

  const filtrados = produtos.filter(p => p.nome.toLowerCase().includes(termo));
  const container = document.getElementById('produtosContainer');
  container.innerHTML = '';

  filtrados.forEach(produto => {
    const card = `
      <div class="col-md-3">
        <div class="card h-100 shadow-sm">
          <img src="${produto.imagem || 'https://via.placeholder.com/300'}" class="card-img-top" alt="${produto.nome}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${produto.nome}</h5>
            <p class="card-text">R$ ${produto.preco.toFixed(2)}</p>
            <small class="text-muted">${produto.categoria || ''}</small>
          </div>
        </div>
      </div>`;
    container.innerHTML += card;
  });

  if (filtrados.length > 0) {
    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }
}

// CHAMAR AO INICIAR
document.addEventListener('DOMContentLoaded', carregarProdutos);
