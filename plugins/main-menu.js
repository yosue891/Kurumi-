import sharp from "sharp";
import { promises as fs } from "fs";
import moment from "moment-timezone";
import fetch from "node-fetch"; // Asegúrate de tener fetch o usa axios

let handler = async (m, { conn, usedPrefix }) => {
  try {
    m.react("🍫");

    let name = await conn.getName(m.sender);
    if (!global.menutext) await global.menu();

    // Mensaje con estilo cool y cariñoso
    let greeting = ucapan();
    let txt = `
╔══════════════╗
║  ✦ ʏᴜʀᴜ ʏᴜʀɪ ✧  ║
╚══════════════╝

👋 ${greeting}, @${m.sender.split("@")[0]}!

${global.menutext}

╔════════════════════════╗
║  📌 Usa: ${usedPrefix}comando para probar ║
╚════════════════════════╝
(⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤
`;

    let mention = conn.parseMention(txt);

    // Preparo la imagen y el thumbnail
    let imager = await sharp("./src/doc_image.jpg").resize(400, 400).toBuffer();
    let img = await fs.readFile("./src/menu.jpg");

    // Enviar menú con imagen, estilo y todo
    await conn.sendMessage(
      m.chat,
      {
        document: img,
        fileName: "✦ ʏᴜʀᴜ ʏᴜʀɪ ✧.png",
        mimetype: "image/png",
        caption: txt,
        fileLength: 1900,
        jpegThumbnail: imager,
        contextInfo: {
          mentionedJid: mention,
          isForwarded: true,
          forwardingScore: 999,
          externalAdReply: {
            title: "Menu de MaycolBot",
            body: `✐ ${global.wm}`,
            thumbnail: img,
            sourceUrl: "",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );

    // Ahora viene el chiste en TTS (sin texto)
    // 1. Pido chiste random en inglés
    const jokeRes = await fetch("https://nightapi.is-a.dev/api/jokes/random");
    if (!jokeRes.ok) throw new Error("No se pudo obtener el chiste");
    const jokeJson = await jokeRes.json();

    // 2. Traduzco chiste a español
    const textoParaTraducir = encodeURIComponent(jokeJson.joke);
    const translateRes = await fetch(
      `https://nightapi.is-a.dev/api/translate?text=${textoParaTraducir}&from=en&to=es`
    );
    if (!translateRes.ok) throw new Error("Error al traducir el chiste");
    const translateJson = await translateRes.json();

    const chisteES = translateJson.translated_text;

    // 3. Genero link TTS con el texto en español
    const ttsUrl = `https://nightapi.is-a.dev/api/tts?text=${encodeURIComponent(
      "Chiste del día gracias a Yuru yuki: " + chisteES
    )}&lang=es`;

    // 4. Envío el audio TTS al chat, sin texto
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: ttsUrl },
        mimetype: "audio/mp3",
        fileName: "chiste-del-dia.mp3",
        ptt: false,
      },
      { quoted: m }
    );
  } catch (e) {
    // Si algo falla, enviamos el menú sin el audio pero no nos caemos
    let fallbackTxt = `❎ Error en menú o chiste: ${e.message}`;
    await conn.reply(m.chat, fallbackTxt, m);
  }
};

handler.command = ["menu", "help", "menú", "commands", "comandos", "?"];
export default handler;

function ucapan() {
  const time = moment.tz("America/Los_Angeles").format("HH");
  if (time >= 18) return "Buenas noches 🌙";
  if (time >= 15) return "Buenas tardes ☀️";
  if (time >= 10) return "¡Hola! Buen día ☀️";
  if (time >= 4) return "¡Buenos días! 🌅";
  return "Hola 👋";
}
