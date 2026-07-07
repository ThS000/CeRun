// CERUN - localStorage.js
// Responsável por gerenciar os dados armazenados no localStorage:
// usuários, sessão (login) e corridas.

function getUsuarios() {
  const dados = localStorage.getItem("usuarios");

  // Se existir, converte o texto para um vetor de usuários.
  // Caso contrário, retorna um vetor vazio.
  return dados ? JSON.parse(dados) : [];
}

function salvarUsuarios(usuarios) {
  // O localStorage só armazena texto, por isso usamos JSON.stringify().
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function cadastrarUsuario(nome, email, senha) {
  const usuarios = getUsuarios();

  for (let i = 0; i < usuarios.length; i++) {
    // Impede que dois usuários tenham o mesmo e-mail.
    if (usuarios[i].email === email) {
      return { ok: false, mensagem: "Já existe uma conta com esse e-mail." };
    }
  }

  const novoUsuario = {
    // Gera um identificador praticamente único usando data e hora.
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

      // Guarda o ID do usuário para manter a sessão ativa.
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

  // Se não existir ID salvo, ninguém está logado.
  if (!id) return null;

  const usuarios = getUsuarios();

  for (let i = 0; i < usuarios.length; i++) {

    // Procura o usuário correspondente ao ID salvo.
    // Foi usado == porque o localStorage retorna texto (string).
    if (usuarios[i].id == id) {
      return usuarios[i];
    }
  }

  return null;
}

function getTodasCorridas() {
  const dados = localStorage.getItem("corridas");

  // Converte o texto em vetor ou retorna um vetor vazio.
  return dados ? JSON.parse(dados) : [];
}

function getCorridasDoUsuario(usuarioId) {
  const corridas = getTodasCorridas();
  const resultado = [];

  for (let i = 0; i < corridas.length; i++) {

    // Adiciona apenas as corridas do usuário informado.
    if (corridas[i].usuarioId === usuarioId) {
      resultado.push(corridas[i]);
    }
  }

  // Ordena da corrida mais recente para a mais antiga.
  resultado.sort(function (a, b) {
    return new Date(b.data) - new Date(a.data);
  });

  return resultado;
}

function salvarCorrida(usuarioId, corrida) {
  const corridas = getTodasCorridas();

  // Cria um ID único e associa a corrida ao usuário.
  corrida.id = Date.now();
  corrida.usuarioId = usuarioId;

  corridas.push(corrida);
  localStorage.setItem("corridas", JSON.stringify(corridas));
}

function excluirCorrida(corridaId) {
  const corridas = getTodasCorridas();
  const novasCorridas = [];

  for (let i = 0; i < corridas.length; i++) {

    // Mantém apenas as corridas que não serão excluídas.
    if (corridas[i].id !== corridaId) {
      novasCorridas.push(corridas[i]);
    }
  }

  localStorage.setItem("corridas", JSON.stringify(novasCorridas));
}