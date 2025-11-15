document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const senha = document.getElementById("senha").value;

  try {
    const resposta = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, senha })
    });

    const data = await resposta.json();

    // Erro de login
    if (!resposta.ok) {
      return Swal.fire({
        icon: "error",
        title: "Login falhou",
        text: data.erro || "Usuário ou senha inválidos!",
        confirmButtonColor: "#d33"
      });
    }

    //  Sucesso
    Swal.fire({
      icon: "success",
      title: "Login realizado!",
      text: "Redirecionando...",
      showConfirmButton: false,
      timer: 1500
    });

    // salvar token e ir pro painel
    localStorage.setItem("token", data.token);

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);

  } catch (erro) {
    Swal.fire({
      icon: "error",
      title: "Erro inesperado",
      text: "Tente novamente mais tarde.",
    });
  }
});

// === LOGIN COM SWEET ALERT (SEU CÓDIGO MESMO) ===
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const senha = document.getElementById("senha").value;

  try {
    const resposta = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, senha })
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      return Swal.fire({
        icon: "error",
        title: "Login falhou",
        text: data.erro || "Usuário ou senha inválidos!",
        confirmButtonColor: "#d33"
      });
    }

    Swal.fire({
      icon: "success",
      title: "Login realizado!",
      text: "Redirecionando...",
      showConfirmButton: false,
      timer: 1500
    });

    localStorage.setItem("token", data.token);

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);

  } catch (erro) {
    Swal.fire({
      icon: "error",
      title: "Erro inesperado",
      text: "Tente novamente mais tarde.",
    });
  }
});

// MOSTRAR/OCULTAR SENHA 
document.getElementById("toggleSenha").addEventListener("click", () => {
  const senhaInput = document.getElementById("senha");
  const icon = document.getElementById("iconSenha");

  if (senhaInput.type === "password") {
    senhaInput.type = "text";
    icon.classList.remove("bi-eye-fill");
    icon.classList.add("bi-eye-slash-fill");
  } else {
    senhaInput.type = "password";
    icon.classList.remove("bi-eye-slash-fill");
    icon.classList.add("bi-eye-fill");
  }
});
