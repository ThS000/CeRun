// CERUN - localStorage.js
// Funções para salvar usuários, sessão (login) e corridas no localStorage

function getUsuarios() {
  const dados = localStorage.getItem("usuarios");
  return dados ? JSON.parse(dados) : [];
}

function salvarUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function cadastrarUsuario(nome, email, senha) {
  const usuarios = getUsuarios();

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].email === email) {
      return { ok: false, mensagem: "Já existe uma conta com esse e-mail." };
    }
  }

  const novoUsuario = {
    id: Date.now(),
    nome: nome,
    email: email,
    senha: senha,
  };

  usuarios.push(novoUsuario);
  salvarUsuarios(usuarios);
  return { ok: true, usuario: novoUsuario };
}

function autenticarUsuario(email, senha) {
  const usuarios = getUsuarios();

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].email === email && usuarios[i].senha === senha) {
      localStorage.setItem("usuarioLogado", usuarios[i].id);
      return { ok: true, usuario: usuarios[i] };
    }
  }

  return { ok: false, mensagem: "E-mail ou senha incorretos." };
}

function encerrarSessao() {
  localStorage.removeItem("usuarioLogado");
}

function getUsuarioLogado() {
  const id = localStorage.getItem("usuarioLogado");
  if (!id) return null;

  const usuarios = getUsuarios();
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].id == id) {
      return usuarios[i];
    }
  }
  return null;
}

function getTodasCorridas() {
  const dados = localStorage.getItem("corridas");
  return dados ? JSON.parse(dados) : [];
}

function getCorridasDoUsuario(usuarioId) {
  const corridas = getTodasCorridas();
  const resultado = [];

  for (let i = 0; i < corridas.length; i++) {
    if (corridas[i].usuarioId === usuarioId) {
      resultado.push(corridas[i]);
    }
  }

  resultado.sort(function (a, b) {
    return new Date(b.data) - new Date(a.data);
  });

  return resultado;
}

function salvarCorrida(usuarioId, corrida) {
  const corridas = getTodasCorridas();
  corrida.id = Date.now();
  corrida.usuarioId = usuarioId;
  corridas.push(corrida);
  localStorage.setItem("corridas", JSON.stringify(corridas));
}

function excluirCorrida(corridaId) {
  const corridas = getTodasCorridas();
  const novasCorridas = [];

  for (let i = 0; i < corridas.length; i++) {
    if (corridas[i].id !== corridaId) {
      novasCorridas.push(corridas[i]);
    }
  }

  localStorage.setItem("corridas", JSON.stringify(novasCorridas));
}