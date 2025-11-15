const API_URL = 'http://localhost:3000/produtos';
const modalForm = new bootstrap.Modal(document.getElementById('modalForm'));
const modalDetalhes = new bootstrap.Modal(document.getElementById('modalDetalhes'));

let editandoId = null;
let paginaAtual = 1;
const porPagina = 12;


//  PROTEÇÃO DE LOGIN
if (!localStorage.getItem("token")) {
  window.location.href = "/login.html";
}


// API COM TOKEN
async function api(url, options = {}) {
  const token = localStorage.getItem("token");

  options.headers = {
    ...(options.headers || {}),
    "Authorization": "Bearer " + token
  };

  if (!(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, options);

// TOKEN EXPIRADO
if (res.status === 401) {
  alert("Sua sessão expirou. Faça login novamente.");
  localStorage.removeItem("token");
  window.location.href = "/login.html";
  return;
}

return res;
}

// CARREGAR PRODUTOS
async function carregarProdutos() {
  try {
    const res = await api('/produtos');
    const produtos = await res.json();

    const produtosContainer = document.getElementById('produtosContainer');
    produtosContainer.innerHTML = '';

    const inicio = (paginaAtual - 1) * porPagina;
    const fim = inicio + porPagina;

    produtos.slice(inicio, fim).forEach(p => {
      produtosContainer.innerHTML += `
        <div class="col-md-3 mb-3">
          <div class="card h-100 shadow-sm">
            <img src="${p.imagem || 'https://via.placeholder.com/300'}"
                 class="card-img-top" alt="${p.nome}">
            <div class="card-body">
              <h5 class="card-title">${p.nome}</h5>

              <p class="text-muted mb-1">
                <small>Código: ${p.codigo || '—'}</small>
              </p>

              <p class="mb-2">
                ${p.descricao
          ? p.descricao.length > 60
            ? p.descricao.substring(0, 60) + '...'
            : p.descricao
          : 'Sem descrição.'}
              </p>

              <p class="mb-1"><strong>Preço:</strong> R$ ${p.preco ? p.preco.toFixed(2) : '0.00'}</p>
              <p class="mb-1"><strong>Quantidade:</strong> ${p.quantidade ?? '—'}</p>
              <p class="mb-1"><strong>Avaliação:</strong> ⭐ ${p.avaliacao ?? '—'}</p>
              <p class="mb-2"><strong>Categoria:</strong> ${p.categoria || '—'}</p>

              <button class="btn btn-outline-primary w-100" onclick="verDetalhes('${p._id}')">
                Detalhes
              </button>
            </div>
          </div>
        </div>`;
    });

    document.getElementById("paginaAtualTexto").textContent = `Página ${paginaAtual}`;
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

//NAVEGAÇAO DE PAGINAS
function proximaPagina() {
  paginaAtual++;
  carregarProdutos();
}
function paginaAnterior() {
  if (paginaAtual > 1) paginaAtual--;
  carregarProdutos();
}

// DETALHES
async function verDetalhes(id) {
  try {
    const res = await api(`${API_URL}/${id}`);
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

//  NOVO PRODUTO
function novoProduto() {
  const form = document.getElementById('formProduto');
  const imagemInput = document.getElementById('imagem');
  form.reset();
  editandoId = null;
  document.getElementById('modalTitle').textContent = 'Novo Produto';
  imagemInput.required = true;
  imagemInput.value = "";
  form.classList.remove("was-validated");
  modalForm.show();
}

//  SALVAR PRODUTO 
document.getElementById('formProduto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }
  const imagemInput = document.getElementById('imagem');
  let imagemUrl = "";

  if (!editandoId && imagemInput.files.length === 0) {
    imagemInput.classList.add("is-invalid");
    return;
  }
  if (imagemInput.files.length > 0) {
    const formData = new FormData();
    formData.append('imagem', imagemInput.files[0]);

    const uploadRes = await api(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
    const uploadData = await uploadRes.json();
    imagemUrl = uploadData.imagem;
  }

  // Criando objeto do produto
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
    const metodo = editandoId ? "PUT" : "POST";
    const url = editandoId ? `${API_URL}/${editandoId}` : API_URL;
    await api(url, {
      method: metodo,
      body: JSON.stringify(produto)
    });
    modalForm.hide();
    form.classList.remove("was-validated");
    Swal.fire({
      icon: "success",
      title: "Produto salvo com sucesso!",
      showConfirmButton: false,
      timer: 1500
    });
    carregarProdutos();

  } catch (erro) {
    console.error("Erro ao salvar produto:", erro);
  }
});

// EDITAR
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
  const imagemInput = document.getElementById("imagem");
  imagemInput.required = false;
  imagemInput.value = "";
  imagemInput.dataset.atual = produto.imagem;

  modalDetalhes.hide();
  modalForm.show();
}

// EXCLUIR
async function excluirProduto(id) {
  Swal.fire({
    title: "Tem certeza?",
    text: "Esta ação não pode ser desfeita!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sim, excluir",
    cancelButtonText: "Cancelar"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api(`${API_URL}/${id}`, { method: "DELETE" });

        Swal.fire({
          icon: "success",
          title: "Produto excluído!",
          showConfirmButton: false,
          timer: 1500
        });

        modalDetalhes.hide();
        carregarProdutos();

      } catch (erro) {
        console.error("Erro ao excluir produto:", erro);
        Swal.fire({
          icon: "error",
          title: "Erro ao excluir",
          text: "Tente novamente.",
        });
      }
    }
  });
}


// BUSCAR PRODUTOS 
async function buscarProduto(event) {
  event.preventDefault();
  const termo = document.getElementById("campoBusca").value.trim().toLowerCase();

  const res = await api(API_URL);
  const produtos = await res.json();

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(termo)
  );

  const container = document.getElementById("produtosContainer");
  container.innerHTML = '';

  filtrados.forEach(p => {
    container.innerHTML += `
      <div class="col-md-3 mb-3">
        <div class="card h-100 shadow-sm">
          <img src="${p.imagem || 'https://via.placeholder.com/300'}"
               class="card-img-top" alt="${p.nome}">
          <div class="card-body">
            <h5 class="card-title">${p.nome}</h5>

            <p class="text-muted mb-1">
              <small>Código: ${p.codigo || '—'}</small>
            </p>

            <p class="mb-2">
              ${p.descricao
                ? p.descricao.length > 60
                  ? p.descricao.substring(0, 60) + '...'
                  : p.descricao
                : 'Sem descrição.'}
            </p>

            <p class="mb-1"><strong>Preço:</strong> R$ ${p.preco ? p.preco.toFixed(2) : '0.00'}</p>
            <p class="mb-1"><strong>Quantidade:</strong> ${p.quantidade ?? '—'}</p>
            <p class="mb-1"><strong>Avaliação:</strong> ⭐ ${p.avaliacao ?? '—'}</p>
            <p class="mb-2"><strong>Categoria:</strong> ${p.categoria || '—'}</p>

            <button class="btn btn-outline-primary w-100" onclick="verDetalhes('${p._id}')">
              Detalhes
            </button>
          </div>
        </div>
      </div>`;
  });

  // SCROLL AUTOMÁTICO PARA RESULTADOS
  if (filtrados.length > 0) {
    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

//  INICIAR
document.addEventListener('DOMContentLoaded', carregarProdutos);
