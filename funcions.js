// CERUN - funcions.js (Versão Otimizada)

// --- UTILITÁRIOS ---
const Utils = {
    // Busca os valores dos 3 campos (h, m, s) e converte em segundos
    getSegundos(prefixo) {
        const h = parseInt(document.getElementById(`${prefixo}Horas`).value) || 0;
        const m = parseInt(document.getElementById(`${prefixo}Minutos`).value) || 0;
        const s = parseInt(document.getElementById(`${prefixo}Segundos`).value) || 0;

        if (m > 59 || s > 59) return { ok: false, msg: "Minutos e segundos devem ser menores que 60." };
        const total = (h * 3600) + (m * 60) + s;
        return total > 0 ? { ok: true, s: total } : { ok: false, msg: "Informe o tempo da corrida." };
    },

    // Formata segundos para hh:mm:ss
    fmtTempo: (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const seg = Math.floor(s % 60);
        const pad = (n) => String(n).padStart(2, '0');
        return `${h}:${pad(m)}:${pad(seg)}`;
    },

    // Formata segundos para pace (min:seg)
    fmtPace: (s) => {
        if (!s) return "--:--";
        const m = Math.floor(s / 60);
        const seg = Math.round(s % 60);
        return `${m}:${String(seg).padStart(2, '0')}`;
    },

    hoje: () => new Date().toISOString().split('T')[0]
};

// --- NAVEGAÇÃO ---
function atualizarNavAuth() {
    const user = getUsuarioLogado();
    const navs = {
        entrar: document.getElementById("navEntrar"),
        dash: document.getElementById("navDashboard"),
        sair: document.getElementById("navSair")
    };

    if (!navs.entrar) return;

    navs.entrar.style.display = user ? "none" : "";
    navs.dash.style.display = user ? "" : "none";
    navs.sair.style.display = user ? "" : "none";

    navs.sair.onclick = (e) => {
        e.preventDefault();
        encerrarSessao();
        location.href = "interface.html";
    };
}

// --- MODAL (HOME) ---
function inicializarModalAuth() {
    const modal = document.getElementById("authModal");
    if (!modal) return;

    // Abrir/Fechar
    document.querySelectorAll("#navEntrar, #ctaComecar").forEach(el => {
        el.onclick = (e) => {
            e.preventDefault();
            if (getUsuarioLogado()) return location.href = "dashboard.html";
            modal.classList.add("active");
        };
    });
    document.getElementById("closeAuthModal").onclick = () => modal.classList.remove("active");

    // Alternar abas
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const isLogin = btn.dataset.tab === "login";
            document.getElementById("loginForm").style.display = isLogin ? "flex" : "none";
            document.getElementById("cadastroForm").style.display = isLogin ? "none" : "flex";
        };
    });

    // Submissão de Forms
    document.getElementById("loginForm").onsubmit = (e) => {
        e.preventDefault();
        const res = autenticarUsuario(e.target.loginEmail.value, e.target.loginSenha.value);
        res.ok ? location.href = "dashboard.html" : document.getElementById("loginError").textContent = res.mensagem;
    };

    document.getElementById("cadastroForm").onsubmit = (e) => {
        e.preventDefault();
        const res = cadastrarUsuario(e.target.cadNome.value, e.target.cadEmail.value, e.target.cadSenha.value);
        if (res.ok) {
            autenticarUsuario(e.target.cadEmail.value, e.target.cadSenha.value);
            location.href = "dashboard.html";
        } else {
            document.getElementById("cadastroError").textContent = res.mensagem;
        }
    };
}

// --- DASHBOARD ---
function renderizarDashboard(user) {
    const corridas = getCorridasDoUsuario(user.id);
    const corpo = document.getElementById("runTableBody");
    
    // Stats (usando reduce para simplificar)
    const stats = corridas.reduce((acc, c) => {
        acc.km += c.distanciaKm;
        acc.s += c.tempoSegundos;
        return acc;
    }, { km: 0, s: 0 });

    document.getElementById("statTotalKm").textContent = stats.km.toFixed(1);
    document.getElementById("statTotalCorridas").textContent = corridas.length;
    document.getElementById("statPaceMedio").textContent = stats.km > 0 ? Utils.fmtPace(stats.s / stats.km) : "--:--";
    document.getElementById("statTempoTotal").textContent = `${Math.floor(stats.s / 3600)}h ${Math.floor((stats.s % 3600) / 60)}min`;

    // Histórico
    document.getElementById("runTable").style.display = corridas.length ? "table" : "none";
    document.getElementById("emptyState").style.display = corridas.length ? "none" : "block";

    corpo.innerHTML = corridas.map(c => `
        <tr>
            <td>${new Date(c.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
            <td>${c.distanciaKm.toFixed(2)} km</td>
            <td>${Utils.fmtTempo(c.tempoSegundos)}</td>
            <td>${Utils.fmtPace(c.paceSegundos)} /km</td>
            <td><button class="btn-excluir" onclick="excluirEAtualizar(${c.id})">✕</button></td>
        </tr>
    `).join("");
}

function excluirEAtualizar(id) {
    excluirCorrida(id);
    renderizarDashboard(getUsuarioLogado());
}

function inicializarPaginaDashboard() {
    const user = getUsuarioLogado();
    if (!user || !document.querySelector(".dashboard-container")) return;

    document.getElementById("userNome").textContent = user.nome;

    // Calculadora
    document.getElementById("btnCalcular").onclick = () => {
        const dist = parseFloat(document.getElementById("calcDistancia").value);
        const tempo = Utils.getSegundos("calc");
        if (!dist || !tempo.ok) return alert(tempo.msg || "Informe a distância.");

        const pace = tempo.s / dist;
        document.getElementById("resultPace").textContent = Utils.fmtPace(pace);
        document.getElementById("resultVelocidade").textContent = (dist / (tempo.s / 3600)).toFixed(2);
    };

    // Registro de Corrida
    const form = document.getElementById("corridaForm");
    form.corridaData.max = Utils.hoje();
    form.onsubmit = (e) => {
        e.preventDefault();
        const dist = parseFloat(form.corridaDistancia.value);
        const tempo = Utils.getSegundos("corrida");

        if (!tempo.ok) return alert(tempo.msg);
        if ((tempo.s / dist) < 100) return alert("Pace muito rápido (abaixo de 1:40/km).");

        salvarCorrida(user.id, {
            data: form.corridaData.value,
            distanciaKm: dist,
            tempoSegundos: tempo.s,
            paceSegundos: tempo.s / dist
        });

        form.reset();
        renderizarDashboard(user);
    };

    renderizarDashboard(user);
}

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    atualizarNavAuth();
    inicializarModalAuth();
    inicializarPaginaDashboard();
});