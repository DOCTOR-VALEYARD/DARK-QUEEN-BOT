// src/rank.js - VER RANKING DO BANCO DE DADOS
const fs = require("fs");
const path = require("path");
const config = require("../../config");

const dbPath = path.join(__dirname, "../../database/usuarios.json");

function lerDB() {
    if (!fs.existsSync(dbPath)) return {};
    try { return JSON.parse(fs.readFileSync(dbPath, "utf8")); } catch { return {}; }
}

function fmt(n) {
    try { return Number(n || 0).toLocaleString("pt-BR"); } catch { return String(n || 0); }
}

// 🏆 Monta o texto do ranking (limpo, com medalhas e alinhado — sem caixinhas)
function montarTextoRanking(usuarios) {
    const medalhas = ["🥇", "🥈", "🥉"];
    const linhas = [`〔 🏆 ʀᴀɴᴋɪɴɢ ᴅᴏ ɢʀᴜᴘᴏ 〕`, "", `👑 Os que mais aparecem no grupo:`, ""];
    usuarios.slice(0, 10).forEach((u, i) => {
        const pos = i < 3 ? medalhas[i] : `🔹 ${i + 1}º`;
        linhas.push(`${pos} ${u.nome || "Sem nome"}`);
        linhas.push(`      ⭐ Nível ${u.nivel || 1}  •  💰 ${fmt(u.ouro)} ouro`);
        linhas.push("");
    });
    linhas.push(`🩸 ${config.BOT_NAME}`, `👑 ${config.OWNER_NAME}`);
    return linhas.join("\n");
}

async function rank(sock, msg, args) {
    const from = msg.key.remoteJid;
    const db = lerDB();
    const usuarios = Object.values(db).sort((a, b) => (b.nivel || 0) - (a.nivel || 0) || (b.xp || 0) - (a.xp || 0));

    if (usuarios.length === 0) {
        return sock.sendMessage(from, {
            text: `〔 🏆 ʀᴀɴᴋɪɴɢ ᴅᴏ ɢʀᴜᴘᴏ 〕\n\n😴 Ninguém pontuou ainda! Comece a conversar pra subir de nível.\n\n🩸 ${config.BOT_NAME}\n👑 ${config.OWNER_NAME}`
        }, { quoted: msg });
    }

    const texto = montarTextoRanking(usuarios);

    // 🎨 Tenta mandar como card de imagem (estilo da casa). Se o canvas falhar
    // por qualquer motivo, cai pro texto limpo — nunca fica sem resposta.
    try {
        const { criarCardRanking } = require("../cards-81/cards-81");
        const png = await criarCardRanking({
            titulo: "RANKING",
            subtitulo: "quem mais manda ver no grupo",
            lista: usuarios.slice(0, 10).map(u => ({ nome: u.nome, nivel: u.nivel || 1, ouro: u.ouro || 0 })),
            botName: config.BOT_NAME
        });
        if (png) return await sock.sendMessage(from, { image: png, caption: texto }, { quoted: msg });
    } catch (e) {
        console.error("⚠️ [rank] card falhou, enviando texto:", e?.message || e);
    }

    await sock.sendMessage(from, { text: texto }, { quoted: msg });
}

module.exports = { rank };
