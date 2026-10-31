/* =================================================
   🩸 DARK QUEEN BOT — MENSAGENS DE SOLICITAÇÃO DE ENTRADA
   📁 Arquivo: solicitacao-mensagens.js
   Tom: soberano e cortês — sem deboche. (Sem card: só texto.)
================================================= */

const pendentes = [
    "🩸 @{nome} solicita audiência à corte. Os administradores decidirão.",
    "👑 Nova solicitação de entrada: @{nome} aguarda a decisão do reino.",
    "🕯️ @{nome} bate aos portões dos domínios. Cabe aos administradores responder.",
    "📜 Pedido registrado: @{nome} deseja juntar-se à corte. Avaliem com critério.",
    "🌙 @{nome} pede passagem para o reino. A decisão está em vossas mãos, administradores.",
    "⚜️ @{nome} aguarda à entrada. Que a admissão seja digna da corte.",
    "🖤 @{nome} apresentou-se aos portões. Os administradores ponderarão sua entrada.",
    "♛ Uma nova solicitação chega ao trono: @{nome}. Administradores, a palavra é vossa.",
    "🌹 @{nome} solicita um lugar entre nós. Que seja julgado(a) com justiça.",
    "👁️ @{nome} requer acesso aos domínios. A corte observa e aguarda.",
    "🕸️ Registrada a solicitação de @{nome}. A decisão pertence aos administradores.",
    "🩸 @{nome} pede para cruzar os portões. Honrai a corte em vossa escolha."
];

const recusadas = [
    "🩸 Solicitação de @{nome} recusada por @{quemRecusou}. A corte segue seu curso.",
    "⚖️ @{quemRecusou} indeferiu o pedido de @{nome}. Decisão soberana, sem apelo.",
    "🖤 Os portões permanecem fechados a @{nome}, por decisão de @{quemRecusou}.",
    "🌑 @{quemRecusou} negou a entrada de @{nome}. Nem toda alma pertence a esta corte.",
    "📜 Pedido de @{nome} arquivado por @{quemRecusou}. Assunto encerrado.",
    "🕯️ @{quemRecusou} declinou a solicitação de @{nome}. A corte assim o quis.",
    "♛ Entrada de @{nome} vetada por @{quemRecusou}. A decisão do trono é definitiva.",
    "🥀 @{quemRecusou} recusou @{nome}. Haverá, talvez, outro reino mais afortunado.",
    "👑 @{quemRecusou} manteve os portões cerrados a @{nome}. Respeite-se a decisão.",
    "🌙 O pedido de @{nome} não foi acolhido. @{quemRecusou} assim determinou.",
    "⚜️ @{quemRecusou} indeferiu a presença de @{nome} nos domínios. Fim de assunto.",
    "🕸️ Solicitação de @{nome} encerrada por @{quemRecusou}. A corte permanece intacta."
];

function preencher(texto, valores) {
    let resultado = texto;
    for (const chave of Object.keys(valores)) {
        resultado = resultado.replace(new RegExp(`\\{${chave}\\}`, "g"), valores[chave]);
    }
    return resultado;
}

function gerarMensagemSolicitacao(nome) {
    const escolhida = pendentes[Math.floor(Math.random() * pendentes.length)];
    return preencher(escolhida, { nome });
}

function gerarMensagemRecusa(nome, quemRecusou) {
    const escolhida = recusadas[Math.floor(Math.random() * recusadas.length)];
    return preencher(escolhida, { nome, quemRecusou });
}

module.exports = { gerarMensagemSolicitacao, gerarMensagemRecusa };
