// CERUN - funcions.js
// Cálculo de pace/velocidade, formulários, modal de login e dashboard

// ---------- Tempo ----------

function tempoParaSegundos(texto) {
  const partes = texto.split(":");
  let h = 0, m = 0, s = 0;

  if (partes.length === 3) {
    h = parseInt(partes[0]);
    m = parseInt(partes[1]);
    s = parseInt(partes[2]);
  } else if (partes.length === 2) {
    m = parseInt(partes[0]);
    s = parseInt(partes[1]);
  } else {
    return null;
  }

  if (isNaN(h) || isNaN(m) || isNaN(s)) return null;
  return h * 3600 + m * 60 + s;
}

function segundosParaTempo(totalSegundos) {
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  const s = Math.floor(totalSegundos % 60);
  return h + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

// ---------- Cálculos ----------

function calcularPaceSegundos(distanciaKm, tempoSegundos) {
  if (distanciaKm <= 0) return null;
  return tempoSegundos / distanciaKm;
}

function calcularVelocidadeKmH(distanciaKm, tempoSegundos) {
  if (tempoSegundos <= 0) return null;
  return distanciaKm / (tempoSegundos / 3600);
}

function formatarPace(paceSegundos) {
  if (!paceSegundos) return "--:--";
  const min = Math.floor(paceSegundos / 60);
  const seg = Math.round(paceSegundos % 60);
  return min + ":" + (seg < 10 ? "0" + seg : seg);
}

// ---------- Nav (Entrar / Dashboard / Sair) ----------

function atualizarNavAuth() {
  const usuario = getUsuarioLogado();
  const linkEntrar = document.getElementById("navEntrar");
  const linkDashboard = document.getElementById("navDashboard");
  const linkSair = document.getElementById("navSair");

  if (!linkEntrar) return;

  if (usuario) {
    linkEntrar.style.display = "none";
    linkDashboard.style.display = "";
    linkSair.style.display = "";
  } else {
    linkEntrar.style.display = "";
    linkDashboard.style.display = "none";
    linkSair.style.display = "none";
  }

  linkSair.addEventListener("click", function (e) {
    e.preventDefault();
    encerrarSessao();
    window.location.href = "interface.html";
  });
}

// ---------- Modal de login/cadastro (só existe na Home) ----------

function inicializarModalAuth() {
  const modal = document.getElementById("authModal");
  if (!modal) return;

  const formLogin = document.getElementById("loginForm");
  const formCadastro = document.getElementById("cadastroForm");
  const abas = modal.querySelectorAll(".tab-btn");

  const navEntrar = document.getElementById("navEntrar");
  if (navEntrar) {
    navEntrar.addEventListener("click", function (e) {
      e.preventDefault();
      modal.classList.add("active");
    });
  }

  const ctaComecar = document.getElementById("ctaComecar");
  if (ctaComecar) {
    ctaComecar.addEventListener("click", function (e) {
      e.preventDefault();
      if (getUsuarioLogado()) {
        window.location.href = "dashboard.html";
      } else {
        modal.classList.add("active");
      }
    });
  }

  document.getElementById("closeAuthModal").addEventListener("click", function () {
    modal.classList.remove("active");
  });

  for (let i = 0; i < abas.length; i++) {
    abas[i].addEventListener("click", function () {
      for (let j = 0; j < abas.length; j++) {
        abas[j].classList.remove("active");
      }
      this.classList.add("active");

      if (this.dataset.tab === "login") {
        formLogin.style.display = "flex";
        formCadastro.style.display = "none";
      } else {
        formLogin.style.display = "none";
        formCadastro.style.display = "flex";
      }
    });
  }

  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginSenha").value;

    const resultado = autenticarUsuario(email, senha);
    if (!resultado.ok) {
      document.getElementById("loginError").textContent = resultado.mensagem;
      return;
    }

    window.location.href = "dashboard.html";
  });

  formCadastro.addEventListener("submit", function (e) {
    e.preventDefault();
    const nome = document.getElementById("cadNome").value;
    const email = document.getElementById("cadEmail").value;
    const senha = document.getElementById("cadSenha").value;

    const resultado = cadastrarUsuario(nome, email, senha);
    if (!resultado.ok) {
      document.getElementById("cadastroError").textContent = resultado.mensagem;
      return;
    }

    autenticarUsuario(email, senha);
    window.location.href = "dashboard.html";
  });
}

// ---------- Dashboard ----------

function inicializarPaginaDashboard() {
  const container = document.querySelector(".dashboard-container");
  if (!container) return;

  const usuario = getUsuarioLogado();
  if (!usuario) {
    window.location.href = "interface.html";
    return;
  }

  document.getElementById("userNome").textContent = usuario.nome;

  configurarCalculadoraRapida();
  configurarFormularioCorrida(usuario);
  renderizarDashboard(usuario);
}

function configurarCalculadoraRapida() {
  const inputDistancia = document.getElementById("calcDistancia");
  const inputTempo = document.getElementById("calcTempo");
  const resultPace = document.getElementById("resultPace");
  const resultVelocidade = document.getElementById("resultVelocidade");

  function recalcular() {
    const distancia = parseFloat(inputDistancia.value);
    const segundos = tempoParaSegundos(inputTempo.value);

    if (!distancia || !segundos) {
      resultPace.textContent = "--:--";
      resultVelocidade.textContent = "--";
      return;
    }

    resultPace.textContent = formatarPace(calcularPaceSegundos(distancia, segundos));
    resultVelocidade.textContent = calcularVelocidadeKmH(distancia, segundos).toFixed(2);
  }

  inputDistancia.addEventListener("input", recalcular);
  inputTempo.addEventListener("input", recalcular);
}

function configurarFormularioCorrida(usuario) {
  const form = document.getElementById("corridaForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = document.getElementById("corridaData").value;
    const distancia = parseFloat(document.getElementById("corridaDistancia").value);
    const segundos = tempoParaSegundos(document.getElementById("corridaTempo").value);

    if (!data || !distancia || !segundos) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    salvarCorrida(usuario.id, {
      data: data,
      distanciaKm: distancia,
      tempoSegundos: segundos,
      paceSegundos: calcularPaceSegundos(distancia, segundos),
    });

    form.reset();
    renderizarDashboard(usuario);
  });
}

function renderizarDashboard(usuario) {
  const corridas = getCorridasDoUsuario(usuario.id);
  renderizarEstatisticas(corridas);
  renderizarHistorico(corridas);
}

function renderizarEstatisticas(corridas) {
  let totalKm = 0;
  let totalSegundos = 0;

  for (let i = 0; i < corridas.length; i++) {
    totalKm += corridas[i].distanciaKm;
    totalSegundos += corridas[i].tempoSegundos;
  }

  document.getElementById("statTotalKm").textContent = totalKm.toFixed(1);
  document.getElementById("statTotalCorridas").textContent = corridas.length;
  document.getElementById("statPaceMedio").textContent =
    totalKm > 0 ? formatarPace(totalSegundos / totalKm) : "--:--";

  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  document.getElementById("statTempoTotal").textContent = horas + "h " + minutos + "min";
}

function renderizarHistorico(corridas) {
  const corpoTabela = document.getElementById("runTableBody");
  const tabela = document.getElementById("runTable");
  const estadoVazio = document.getElementById("emptyState");

  corpoTabela.innerHTML = "";

  if (corridas.length === 0) {
    tabela.style.display = "none";
    estadoVazio.style.display = "block";
    return;
  }

  tabela.style.display = "table";
  estadoVazio.style.display = "none";

  for (let i = 0; i < corridas.length; i++) {
    const corrida = corridas[i];
    const dataFormatada = new Date(corrida.data + "T00:00:00").toLocaleDateString("pt-BR");

    const linha = document.createElement("tr");
    linha.innerHTML =
      "<td>" + dataFormatada + "</td>" +
      "<td>" + corrida.distanciaKm.toFixed(2) + " km</td>" +
      "<td>" + segundosParaTempo(corrida.tempoSegundos) + "</td>" +
      "<td>" + formatarPace(corrida.paceSegundos) + " /km</td>" +
      "<td><button class='btn-excluir' data-id='" + corrida.id + "'>✕</button></td>";

    corpoTabela.appendChild(linha);
  }

  const botoes = corpoTabela.querySelectorAll(".btn-excluir");
  for (let i = 0; i < botoes.length; i++) {
    botoes[i].addEventListener("click", function () {
      excluirCorrida(Number(this.dataset.id));
      renderizarDashboard(getUsuarioLogado());
    });
  }
}

// ---------- Roda em toda página ----------

document.addEventListener("DOMContentLoaded", function () {
  atualizarNavAuth();
  inicializarModalAuth();
  inicializarPaginaDashboard();
});