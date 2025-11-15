document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const senha = document.getElementById('senha').value;
  const erroMsg = document.getElementById('erro');

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, senha })
    });

    const data = await res.json();

    if (!res.ok) {
      erroMsg.textContent = data.erro || 'Usuário ou senha inválidos.';
      return;
    }

    // salvar token
    localStorage.setItem('token', data.token);

    // redirecionar
    window.location.href = '/index.html';

  } catch (err) {
    erroMsg.textContent = 'Erro no servidor.';
  }
});
