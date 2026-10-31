/* =================================================
   🩸 DARK QUEEN BOT — MENSAGENS DE ENTRADA E SAÍDA DO GRUPO
   📁 Arquivo: boasvindas-mensagens.js
   Tom: soberano, elegante e sombrio — sem deboche.
================================================= */

// 👑 Chamadas de entrada — recepção régia, com presença e classe.
const chamadasEntrada = [
    "👑 Uma nova presença adentra os domínios. Seja bem-vindo(a) à corte.",
    "🩸 As portas se abriram. Contemple quem a elas chegou.",
    "🌙 Mais uma alma cruza o umbral. Que honre o lugar que lhe foi concedido.",
    "♛ A corte recebe um novo membro. Comporte-se à altura.",
    "🕯️ Alguém se aproxima do trono. A Rainha observa, como sempre.",
    "🖤 Bem-vindo(a) ao reino. Aqui, o respeito é a primeira moeda.",
    "🥀 Um novo nome se junta à nossa história. Faça por merecê-lo.",
    "🌑 A escuridão abre passagem para mais um convidado. Entre com reverência.",
    "👁️ Nova presença detectada na corte. Nada escapa ao olhar da Rainha.",
    "⚜️ Que os portões se abram: chegou mais um aos domínios da Dark Queen.",
    "🩸 Seja bem-vindo(a). O silêncio aqui também fala — aprenda a ouvi-lo.",
    "🌹 Uma rosa a mais no jardim. Resta saber se tem espinhos ou perfume.",
    "♜ A corte cresce. Que sua chegada seja digna de memória.",
    "🕸️ Entrou nos domínios da Rainha. Mova-se com sabedoria.",
    "👑 Recebido(a) no reino. Grandeza se conquista, nunca se exige."
];

// 🥀 Despedidas de saída — frias, elegantes, soberanas (sem zoeira barata).
const zoeirasSaida = [
    "🥀 @{nome} retirou-se da corte. A Rainha mal notará a ausência.",
    "🌑 @{nome} deixou os domínios. Que o silêncio lhe faça companhia.",
    "🖤 @{nome} partiu. Nem todo convidado suporta o peso de uma coroa.",
    "🕯️ A vela de @{nome} se apagou nesta corte. Fim de passagem.",
    "♛ @{nome} abandonou o reino. O trono permanece — as cadeiras vazias, também.",
    "🩸 @{nome} saiu sem reverência. A história seguirá sem o seu nome.",
    "🌙 @{nome} desapareceu nas sombras. Alguns não nasceram para a corte.",
    "🥀 Mais uma pétala caiu: @{nome} deixou os domínios da Rainha.",
    "👁️ @{nome} virou as costas ao trono. A Rainha já havia previsto.",
    "🕸️ @{nome} escapou pela porta dos fundos. Discreto, porém esquecível.",
    "🖤 @{nome} partiu em silêncio. O eco, este sim, permanece.",
    "⚰️ Encerra-se a passagem de @{nome} por este reino.",
    "🌹 @{nome} retirou sua rosa do jardim. O solo nem sentirá falta.",
    "♜ @{nome} recuou do tabuleiro. A partida continua sem perda alguma.",
    "🩸 @{nome} abdicou do próprio lugar. A corte raramente implora por retornos."
];

function preencher(texto, nome) {
    return texto.replace(/\{nome\}/g, nome);
}

function gerarChamadaEntrada() {
    return chamadasEntrada[Math.floor(Math.random() * chamadasEntrada.length)];
}

function gerarZoeiraSaida(nome) {
    const escolhida = zoeirasSaida[Math.floor(Math.random() * zoeirasSaida.length)];
    return preencher(escolhida, nome);
}

// ─────────────────────────────────────────────────
// 📐 MONTAGEM DAS MENSAGENS (visual sóbrio, letrinhas pequenas + 🩸)
// ─────────────────────────────────────────────────

// WhatsApp corta legenda de imagem em ~1024 caracteres.
const LIMITE_LEGENDA = 950;

function limparRegras(texto) {
    return String(texto || "")
        .replace(/\r/g, "")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function montarTextoRegras(regras, { nomeBot, nomeDono } = {}) {
    const rodape = nomeBot ? `\n\n🩸 ${nomeBot}${nomeDono ? `\n👑 ${nomeDono}` : ""}` : "";
    return `〔 📜 ᴅᴇᴄʀᴇᴛᴏs ᴅᴀ ᴄᴏʀᴛᴇ 〕\n\n${limparRegras(regras)}${rodape}`;
}

function montarBemVindoPartes({ chamada, nomeUsuario, nomeGrupo, totalMembros, regras, autorAceite, semFoto, nomeBot, nomeDono }) {
    const topo = [
        `〔 👑 ᴜᴍᴀ ɴᴏᴠᴀ ᴘʀᴇsᴇɴᴄ̧ᴀ 〕`,
        "",
        chamada,
        "",
        `> 👤 @${nomeUsuario}`,
        `> 🏷️ ${nomeGrupo}`,
        `> 👥 ${totalMembros} membros`
    ];
    if (autorAceite) topo.push(`> ✅ Admitido(a) por @${autorAceite}`);

    const fim = ["", `💬 Apresente-se à corte — a discrição também é uma forma de elegância.`];
    if (semFoto) fim.push(`🖼️ _Sem retrato definido — considere adornar o seu perfil._`);
    fim.push("", `🩸 ${nomeBot}\n👑 ${nomeDono}`);

    const regrasLimpas = limparRegras(regras);
    const blocoRegras = regrasLimpas ? ["", `〔 📜 ᴅᴇᴄʀᴇᴛᴏs ᴅᴀ ᴄᴏʀᴛᴇ 〕`, "", regrasLimpas] : [];

    const completo = [...topo, ...blocoRegras, ...fim].join("\n");
    if (completo.length <= LIMITE_LEGENDA || !regrasLimpas) {
        return { legenda: completo, regrasExtra: null };
    }
    return {
        legenda: [...topo, "", `📜 _Os decretos completos seguem logo abaixo_ 👇`, ...fim].join("\n"),
        regrasExtra: montarTextoRegras(regrasLimpas, { nomeBot, nomeDono })
    };
}

function montarMensagemBemVindo(dados) {
    return montarBemVindoPartes(dados).legenda;
}

// 🥀 Saída em tom soberano. motivo: "saiu" | "removido"
function montarMensagemSaida({ zoeira, nomeGrupo, totalMembros, nomeBot, nomeDono, nomeUsuario, tempoNoGrupo, motivo, autor }) {
    const removido = motivo === "removido";
    const linhas = [
        `〔 🩸 ʀᴇɢɪsᴛʀᴏ ᴅᴀ ᴄᴏʀᴛᴇ 〕`,
        removido ? `⚖️ *BANIDO(A) DOS DOMÍNIOS*` : `🥀 *RETIROU-SE DA CORTE*`,
        "",
        zoeira,
        ""
    ];
    if (nomeUsuario) linhas.push(`> 👤 @${nomeUsuario}`);
    linhas.push(`> 🏷️ ${nomeGrupo}`);
    if (tempoNoGrupo) linhas.push(`> ⏳ Permaneceu ${tempoNoGrupo}`);
    if (removido && autor) linhas.push(`> ⚖️ Banido(a) por @${autor}`);
    linhas.push(`> 👥 Restam ${totalMembros} membros`, "", `🩸 ${nomeBot}\n👑 ${nomeDono}`);
    return linhas.join("\n");
}

module.exports = { gerarChamadaEntrada, gerarZoeiraSaida, montarMensagemBemVindo, montarBemVindoPartes, montarTextoRegras, montarMensagemSaida };
