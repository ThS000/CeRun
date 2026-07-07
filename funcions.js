// ==========================================
// CERUN - Core Functions (Refatorado)
// ==========================================

const Utils = {
    // Transforma inputs (h, m, s) em segundos totais
    camposParaSegundos(prefixo) {
        const h = parseInt(document.getElementById(`${prefixo}Horas`).value) || 0;
        const m = parseInt(document.getElementById(`${prefixo}Minutos`).value) || 0;
        const s = parseInt(document.getElementById(`${prefixo}Segundos`).value) || 0;

        if (m > 59 || s > 59) return { ok: false, msg: "Minutos/Segundos inválidos (máx 59)." };
        const total = h * 3600 + m * 60 + s;
        return total > 0 ? { ok: true, s: total } : { ok: false, msg: "Informe o tempo." };
    },

    // Formata segundos para h:mm:ss ou m:ss
    formatarTempo(segundos, completo = true) {
        if (!segundos) return "--:--";
        const h = Math.floor(segundos / 3600);
        const m = Math.floor((segundos % 3600) / 60);
        const s = Math.round(segundos % 60);
        const pad = (n) => String(n).padStart(2, '0');
        
        return completo && h > 0 
            ? `${h}:${pad(m)}:${pad(s)}` 
            : `${completo ? pad(m) : m}:${pad(s)}`;
    },

    dataHoje: () => new Date().toISOString().split('T')[0]
};

// ---------- Navegação e Auth ----------

function atualizarNavAuth() {
    const user = getUsuarioLogado();
    const btnEntrar = document.getElementById("navEntrar");
    if (!btnEntrar) return;

    document.getElementById("navDashboard").style.display = user ? "" : "none";
    document.getElementById("navSair").style.display = user ? "" : "none";
    btnEntrar.style.display = user ? "none" : "";

    document.getElementById("navSair").onclick = () => {
        encerrarSessao();
        location.href = "interface.html";
    };
}

// ---------- Dashboard & Cálculos ----------

function configurarCalculadoraRapida() {
    const btn = document.getElementById("btnCalcular");
    if (!btn) return;

    btn.onclick = () => {
        const dist = parseFloat(document.getElementById("calcDistancia").value);
        const tempo = Utils.camposParaSegundos("calc");

        if (!dist || !tempo.ok) return alert(tempo.msg || "Dados inválidos");

        const pace = tempo.s / dist;
        document.getElementById("resultPace").textContent = Utils.formatarTempo(pace, false);
        document.getElementById("resultVelocidade").textContent = (dist / (tempo.s / 3600)).toFixed(2);
    };
}

function configurarFormularioCorrida(user) {
    const form = document.getElementById("corridaForm");
    if (!form) return;

    const inputData = document.getElementById("corridaData");
    inputData.max = Utils.dataHoje();
    inputData.min = "2018-01-01";

    form.onsubmit = (e) => {
        e.preventDefault();
        const dist = parseFloat(document.getElementById("corridaDistancia").value);
        const tempo = Utils.camposParaSegundos("corrida");

        if (!tempo.ok) return alert(tempo.msg);
        if (tempo.s / dist < 100) return alert("Pace improvável (muito rápido)!");

        salvarCorrida(user.id, {
            data: inputData.value,
            distanciaKm: dist,
            tempoSegundos: tempo.s,
            paceSegundos: tempo.s / dist
        });

        form.reset();
        renderizarDashboard(user);
    };
}

function renderizarDashboard(user) {
    const corridas = getCorridasDoUsuario(user.id);
    
    // Estatísticas usando reduce (mais limpo que for)
    const stats = corridas.reduce((acc, c) => {
        acc.km += c.distanciaKm;
        acc.seg += c.tempoSegundos;
        return acc;
    }, { km: 0, seg: 0 });

    document.getElementById("statTotalKm").textContent = stats.km.toFixed(1);
    document.getElementById("statTotalCorridas").textContent = corridas.length;
    document.getElementById("statPaceMedio").textContent = Utils.formatarTempo(stats.seg / stats.km, false);
    document.getElementById("statTempoTotal").textContent = `${Math.floor(stats.seg / 3600)}h ${Math.floor((stats.seg % 3600) / 60)}min`;

    // Histórico
    const corpoTabela = document.getElementById("runTableBody");
    document.getElementById("runTable").style.display = corridas.length ? "table" : "none";
    document.getElementById("emptyState").style.display = corridas.length ? "none" : "block";

    corpoTabela.innerHTML = corridas.map(c => `
        <tr>
            <td>${new Date(c.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
            <td>${c.distanciaKm.toFixed(2)} km</td>
            <td>${Utils.formatarTempo(c.tempoSegundos)}</td>
            <td>${Utils.formatarTempo(c.paceSegundos, false)} /km</td>
            <td><button class="btn-excluir" onclick="excluirEAtualizar(${c.id})">✕</button></td>
        </tr>
    `).join("");
}

function excluirEAtualizar(id) {
    excluirCorrida(id);
    renderizarDashboard(getUsuarioLogado());
}

// ---------- Inicialização ----------

document.addEventListener("DOMContentLoaded", () => {
    atualizarNavAuth();
    // Se estiver na Home (existe modal)
    if (typeof inicializarModalAuth === "function") inicializarModalAuth(); 
    
    const user = getUsuarioLogado();
    if (user && document.querySelector(".dashboard-container")) {
        document.getElementById("userNome").textContent = user.nome;
        configurarCalculadoraRapida();
        configurarFormularioCorrida(user);
        renderizarDashboard(user);
    }
});