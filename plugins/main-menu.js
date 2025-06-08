import sharp from "sharp";
import { promises as fs } from 'fs';
import moment from 'moment-timezone';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix }) => {
  m.react("🍫");
  let name = await conn.getName(m.sender);
  if (!global.menutext) await global.menu();

  let cap = global.menutext;
  let txt = `👋 ${ucapan()}, @${m.sender.split("@")[0]} !\n\n${cap}\n(⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤\n(⁠｡⁠･⁠ω⁠･⁠｡⁠)⁠ﾉ⁠♡\n⊂⁠((⁠・⁠▽⁠・⁠))⁠⊃`;
  let mention = conn.parseMention(txt);

  try {
    let imager = await sharp('./src/doc_image.jpg').resize(400, 400).toBuffer();
    let img = await fs.readFile("./src/menu.jpg");
    await conn.sendMessage(
      m.chat,
      {
        document: img,
        fileName: "✦ ʏᴜʀᴜ ʏᴜʀɪ ✧",
        mimetype: "image/png",
        caption: txt,
        jpegThumbnail: imager,
        contextInfo: {
          mentionedJid: mention,
          isForwarded: true,
          forwardingScore: 999,
          externalAdReply: {
            title: "",
            body: `✐ ${global.wm}`,
            thumbnail: img,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
  } catch (e) {
    await conn.reply(m.chat, txt, m, { mentions: mention });
    await conn.reply(m.chat, "❎ Error al mostrar el menú principal : " + e, m);
  }

  // ✨ A partir de aquí, hacemos la petición del chiste y TTS
  try {
    let jokeRes = await fetch("https://nightapi.is-a.dev/api/jokes/random");
    let jokeJson = await jokeRes.json();
    let jokeText = jokeJson.joke;

    let ttsUrl = `https://nightapi.is-a.dev/api/tts?text=${encodeURIComponent("Chiste del día gracias a SoyMaycol y Wirk: " + jokeText)}&lang=es`;

    let audioRes = await fetch(ttsUrl);
    let audioBuffer = await audioRes.buffer();

    await conn.sendMessage(
      m.chat,
      { audio: audioBuffer, mimetype: "audio/mp4", fileName: "chiste.mp4" },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, `😂 *Chiste del día:* ${jokeText}`, { quoted: m });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, "🤖 No se pudo cargar el chiste hoy, pero igual te mando amor 💖", { quoted: m });
  }

  await global.menu();
};

handler.command = ["menu", "help", "menú", "commands", "comandos", "?"];

export default handler;

function ucapan() {
  const time = moment.tz("America/Lima").hour();
  if (time >= 18) return "Good night.";
  if (time >= 15) return "Good afternoon.";
  if (time >= 10) return "Good afternoon.";
  if (time >= 4) return "Good morning.";
  return "Hello.";
}
