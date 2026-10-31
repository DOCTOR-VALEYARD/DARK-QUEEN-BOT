/* =================================================
   💬 DARK QUEEN BOT — DARK QUEEN-AUTO (auto-resposta de TEXTO)
   📁 Arquivo: anjinho-auto.js

   Vem LIGADO por padrão. É o responsável por responder MENSAGENS DE
   TEXTO do grupo (o "saudação" continua separado, mandando os ÁUDIOS).

   O que ele faz quando está ligado:
     ☀️ Saudações: bom dia / boa tarde / boa noite / oi / salve...
        → responde com uma frase (texto), sempre diferente.
     🤬 Palavrão: se alguém xinga (palavra inteira OU abreviação da
        geração Z, tipo "vsf", "pqp", "krl", "fdp"...), o bot MARCA a
        pessoa com uma resposta debochada.
     🙂 Algumas frases relevantes (obrigado, kkk, bom demais...) também
        ganham resposta.

   As mensagens saem em letrinha pequena automaticamente (estilo-texto),
   então aqui a gente escreve normal.

   Comando pra ligar/desligar:  <prefixo>anjinho-auto
   Guardado em getDB()[grupo].anjinhoAuto  (ausente = ligado).
================================================= */
const { getDB, saveDB } = require("../grupo-db/grupo-db");

// ─────────────────────────────────────────────
// 🔤 NORMALIZA (tira acento, minúsculo) e tokeniza
// ─────────────────────────────────────────────
function normalizar(txt) {
    return String(txt || "")
        .toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// ─────────────────────────────────────────────
// ☀️ SAUDAÇÕES — detecção
// ─────────────────────────────────────────────
const RE_BOM_DIA = /\b(bo[mn]\s*di[ae]+|bdomdia)\b/;
const RE_BOA_TARDE = /\b(bo[ae]\s*tarde+|boatarde)\b/;
const RE_BOA_NOITE = /\b(bo[ae]\s*noite+|boanoite)\b/;
const RE_OI = /\b(oi+|ola+|opa+|eai+|eae+|salve+|fala+|iai+|blz|suave|dnd|tranquilo|tranquilos|boas)\b/;

// ─────────────────────────────────────────────
// 🙂 FRASES RELEVANTES — gatilho → tipo de resposta
// ─────────────────────────────────────────────
const RE_AGRADECE = /\b(obrigad[oa]+|obg|brigad[oa]+|vlw+|valeu+|vls|agradec)\b/;
const RE_RISADA = /\b(k{3,}|rs{2,}|haha+|hehe+|kkkk+|auha+|hahaha+)\b/;
const RE_ELOGIO = /\b(bom demais|muito bom|top demais|que massa|maravilhos[oa]|sensacional|incrivel|perfeito|amei|adorei|que legal|dahora|da hora|arrombad[ao] de bom)\b/;

// ─────────────────────────────────────────────
// 🤬 PALAVRÕES — lista (palavras inteiras e abreviações geração Z)
//   A detecção pega: começo/meio/fim da frase, sozinho, maiúsculo ou
//   minúsculo, com letras repetidas (ex.: "krlll", "vsffff", "pqppp").
// ─────────────────────────────────────────────
const PALAVROES = [
    // palavras inteiras
    "caralho", "caraio", "crlh", "porra", "poha", "poxa vida nao", "merda", "bosta",
    "buceta", "boceta", "xoxota", "ppk", "piroca", "pica", "rola", "pau no cu",
    "cu", "cuzao", "cuzinho", "fiofo", "viado", "viadinho", "bicha", "baitola",
    "corno", "cornao", "chifrudo", "otario", "otaria", "babaca", "idiota", "imbecil",
    "arrombado", "arrombada", "desgraca", "desgracado", "desgracada", "disgraca",
    "puta", "putaria", "puto", "putinha", "vagabundo", "vagabunda", "vagaba",
    "piranha", "piranhao", "safado", "safada", "escroto", "escrota", "lixo",
    "nojento", "nojenta", "retardado", "retardada", "burro", "burra", "jumento",
    "fdp", "filho da puta", "filha da puta", "fdps", "fodase", "foda se", "foda-se",
    "foda", "fudeu", "fudido", "fudida", "se fode", "se fuder", "vai se fuder",
    "merdinha", "bostinha", "trouxa", "mongol", "mongoloide", "demente",
    // abreviações / geração Z
    "vsf", "vsfd", "vtnc", "vtmnc", "vtmnf", "pqp", "pqpp", "tnc", "tmnc",
    "krl", "krlh", "crl", "prr", "mds nao", "pnc", "pdc", "fdc", "cdf nao",
    "slk", "slc", "vai tomar no cu", "toma no cu", "tomar no cu", "tnc filho"
];

// monta uma regex que casa a palavra inteira, aceitando letras repetidas no fim
function montarRegexPalavroes() {
    const partes = PALAVROES.map(p => {
        const esc = p.normalize("NFD").replace(/[̀-ͯ]/g, "")
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // deixa a última letra repetível (krl -> krl+, vsf -> vsf+, caralho -> caralho+)
        return esc.replace(/(.)$/, "$1+");
    });
    // (?<![a-z0-9]) e (?![a-z0-9]) = fronteira que também vale pra abreviação
    return new RegExp(`(?<![a-z0-9])(?:${partes.join("|")})(?![a-z0-9])`, "i");
}
const RE_PALAVROES = montarRegexPalavroes();

function temPalavrao(txt) {
    const n = normalizar(txt).replace(/[^a-z0-9\s]/g, " ");
    try { return RE_PALAVROES.test(n); } catch { return false; }
}

// ─────────────────────────────────────────────
// 🧱 BANCOS DE RESPOSTA (combinatórios = milhares de variações)
// ─────────────────────────────────────────────
const aleat = (arr) => arr[Math.floor(Math.random() * arr.length)];
const EMOJIS_FELIZ = ["", " 👑", " 🩸", " 🖤", " 🌙", " 🕯️", " 🌹", " ✨", " ♛", " ⚜️", " 🥀", " 🌑", " 👁️"];
const EMOJIS_DEBOCHE = ["", " 🖤", " 🩸", " 👁️", " ⚖️", " 🌑", " 🥀", " ♛", " 🕯️"];

function montar(aberturas, nucleos, emojis) {
    return `${aleat(aberturas)}${aleat(nucleos)}${aleat(emojis)}`.replace(/\s+/g, " ").trim();
}

const AB_BOM = ["", "nobre súdito, ", "saudações, ", "que seja, ", "pois bem, ", "eis a corte: ", "que a corte o(a) ouça: "];
const BOM_DIA = [
    "bom dia. que a jornada lhe seja próspera", "bom dia. que o reino floresça sob o seu passo",
    "bom dia. a Rainha deseja-lhe um dia digno", "bom dia. que a luz o(a) acompanhe nos domínios",
    "bom dia. que suas conquistas sejam dignas da corte", "bom dia, nobre presença",
    "bom dia. que a manhã lhe traga sabedoria", "bom dia. a corte saúda o seu despertar",
    "bom dia. que o dia se curve à sua vontade", "bom dia. que a grandeza o(a) acompanhe"
];
const BOA_TARDE = [
    "boa tarde. que o reino lhe seja favorável", "boa tarde. a corte reconhece a sua presença",
    "boa tarde. que a tarde renda bons frutos", "boa tarde, nobre súdito",
    "boa tarde. que a serenidade reine sobre você", "boa tarde. a Rainha deseja-lhe constância",
    "boa tarde. que o resto do dia lhe seja brando", "boa tarde. que a sabedoria guie seus passos",
    "boa tarde. a corte permanece ao seu lado", "boa tarde. que a tarde lhe traga paz"
];
const BOA_NOITE = [
    "boa noite. que o repouso restaure suas forças", "boa noite. que as sombras lhe guardem o sono",
    "boa noite. a corte se recolhe, e você também deveria", "boa noite, nobre presença",
    "boa noite. que a lua vele por você", "boa noite. que amanhã retorne com grandeza",
    "boa noite. que os seus sonhos sejam dignos de um reino", "boa noite. descanse, a corte permanece",
    "boa noite. que a escuridão lhe seja serena", "boa noite. até que o novo dia o(a) convoque"
];
const OI = [
    "saudações. em que a corte pode servi-lo(a)?", "diga, nobre súdito. a Rainha ouve",
    "a corte reconhece a sua presença", "saudações. a Rainha está à disposição",
    "fale. o trono dá-lhe audiência", "seja bem-vindo(a) à conversa da corte",
    "saudações. como posso servir ao reino hoje?", "a Rainha concede-lhe a palavra",
    "diga ao que veio. a corte escuta", "saudações, nobre presença"
];
const AGRADECE = [
    "às ordens. a corte está sempre à disposição", "disponha. servir é o dever da Rainha",
    "é uma honra servir ao reino", "sempre que precisar, a corte estará aqui",
    "não há o que agradecer — é o meu papel", "a Rainha serve aos seus com prazer",
    "estou à sua disposição, nobre súdito", "conte comigo, como sempre"
];
const RISADA = [
    "vossa graça me diverte", "um sorriso raro, porém concedido", "a corte aprecia o bom humor",
    "confesso: isso me arrancou um sorriso", "divertido. a Rainha raramente se diverte",
    "bem observado. a corte ri com elegância", "espirituoso. digno de aplausos discretos"
];
const ELOGIO = [
    "fico honrada com suas palavras", "a corte agradece o reconhecimento",
    "gentileza nobre. a Rainha aprecia", "que suas palavras sejam tão duradouras quanto o reino",
    "honra-me o seu apreço", "a corte retribui a cortesia", "reconhecimento sempre é bem-vindo ao trono"
];

// Reprovação soberana quando ofende (marca a pessoa) — fria e elegante, sem deboche.
const DEB_AB = ["modere o verbo", "a corte não tolera tamanha baixeza", "contenha-se", "que vocabulário indigno",
    "a Rainha ouviu, e desaprova", "eis a falta de compostura", "guarde esse linguajar", "impróprio",
    "a elegância lhe falta", "a corte observa, e não se agrada", "reveja suas palavras", "deplorável"];
const DEB_NUC = [
    "nesta corte, fala-se com respeito", "a ofensa não lhe confere razão alguma",
    "palavras baixas revelam quem as profere", "a grosseria não impressiona o trono",
    "recolha-se e retorne com compostura", "a Rainha não se abala com insultos",
    "o respeito é a primeira lei deste reino", "quem ofende a corte, rebaixa a si mesmo",
    "a elegância é de graça, e ainda assim lhe falta", "modere o tom diante do trono",
    "a ira mal dirigida não comove a Rainha", "a corte perdoa o deslize, mas registra a falta",
    "guarde sua indignação para causas dignas", "nesta corte, a palavra também tem etiqueta",
    "menos veneno, mais compostura"
];

// ─────────────────────────────────────────────
// ✉️ GERA A RESPOSTA
// ─────────────────────────────────────────────
function respostaBomDia() { return montar(AB_BOM, BOM_DIA, EMOJIS_FELIZ); }
function respostaBoaTarde() { return montar(AB_BOM, BOA_TARDE, EMOJIS_FELIZ); }
function respostaBoaNoite() { return montar(AB_BOM, BOA_NOITE, EMOJIS_FELIZ); }
function respostaOi() { return montar(AB_BOM, OI, EMOJIS_FELIZ); }
function respostaAgradece() { return `${aleat(AGRADECE)}${aleat(EMOJIS_FELIZ)}`.trim(); }
function respostaRisada() { return `${aleat(RISADA)}${aleat(EMOJIS_FELIZ)}`.trim(); }
function respostaElogio() { return `${aleat(ELOGIO)}${aleat(EMOJIS_FELIZ)}`.trim(); }
function respostaDeboche() { return montar(DEB_AB.map(a => a + ", "), DEB_NUC, EMOJIS_DEBOCHE); }

// ─────────────────────────────────────────────
// 🔛 está ligado? (ausente = ligado por padrão)
// ─────────────────────────────────────────────
function estaLigado(from) {
    const g = getDB()[from] || {};
    return g.anjinhoAuto !== false;
}

// ─────────────────────────────────────────────
// 🧠 PROCESSADOR — chamado no fluxo de mensagem (não-comando)
//   Retorna:
//     "curse" → tratou um palavrão (o handler deve PARAR aqui)
//     "greet" → respondeu saudação/frase em texto (handler pode seguir,
//               pra o "saudação" ainda mandar o áudio dele)
//     null    → não fez nada
// ─────────────────────────────────────────────
async function processarAnjinhoAuto(sock, msg, body) {
    try {
        const from = msg?.key?.remoteJid;
        if (!from) return null;
        if (!estaLigado(from)) return null;
        const texto = String(body || "");
        if (!texto.trim()) return null;

        const autor = msg.key.participant || msg.key.participantAlt || from;

        // 🤬 PALAVRÃO → marca com deboche (prioridade máxima)
        if (temPalavrao(texto)) {
            await sock.sendMessage(from, {
                text: `@${String(autor).split("@")[0].split(":")[0]} ${respostaDeboche()}`,
                mentions: [autor]
            }, { quoted: msg });
            return "curse";
        }

        const n = normalizar(texto);

        // ☀️ SAUDAÇÕES (texto) — o áudio continua sendo do "saudação"
        if (RE_BOM_DIA.test(n)) { await sock.sendMessage(from, { text: respostaBomDia() }, { quoted: msg }); return "greet"; }
        if (RE_BOA_TARDE.test(n)) { await sock.sendMessage(from, { text: respostaBoaTarde() }, { quoted: msg }); return "greet"; }
        if (RE_BOA_NOITE.test(n)) { await sock.sendMessage(from, { text: respostaBoaNoite() }, { quoted: msg }); return "greet"; }

        // 🙂 FRASES RELEVANTES
        if (RE_AGRADECE.test(n)) { await sock.sendMessage(from, { text: respostaAgradece() }, { quoted: msg }); return "greet"; }
        if (RE_ELOGIO.test(n)) { await sock.sendMessage(from, { text: respostaElogio() }, { quoted: msg }); return "greet"; }
        if (RE_RISADA.test(n)) { await sock.sendMessage(from, { text: respostaRisada() }, { quoted: msg }); return "greet"; }

        // 👋 oi/salve só respondem se a mensagem for CURTA (evita responder
        // "oi" no meio de um textão)
        if (RE_OI.test(n) && n.trim().split(/\s+/).length <= 3) {
            await sock.sendMessage(from, { text: respostaOi() }, { quoted: msg });
            return "greet";
        }

        return null;
    } catch (e) {
        console.error("anjinho-auto:", e?.message || e);
        return null;
    }
}

// ⚙️ Liga/desliga (comando <prefixo>anjinho-auto)
async function toggleAnjinhoAuto(sock, msg) {
    const from = msg.key.remoteJid;
    const db = getDB(); db[from] ||= {};
    // ausente = ligado; então o toggle considera isso
    const ligadoAgora = db[from].anjinhoAuto !== false;
    db[from].anjinhoAuto = !ligadoAgora;
    saveDB(db);
    const estado = db[from].anjinhoAuto;
    const resp = estado
        ? `✅ *DARK QUEEN-AUTO ATIVADO*\n\nA partir de agora, respondo às mensagens da corte: saudações, cortesias e uma reprovação serena a quem ofende. 🩸`
        : `❌ *DARK QUEEN-AUTO DESATIVADO*\n\nDeixo de responder automaticamente às mensagens da corte.`;
    await sock.sendMessage(from, { text: resp }, { quoted: msg });
}

module.exports = { processarAnjinhoAuto, toggleAnjinhoAuto, temPalavrao };
