import fetch from 'node-fetch';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import moment from 'moment-timezone';

let handler = async (m, { conn, usedPrefix }) => {
  m.react("🍫");
  let nombre = await conn.getName(m.sender);

  // Llamada a la API para la miniatura
  let apiUrl = `https://nightapi.is-a.dev/api/mayeditor?url=https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAoH2L-_2H07icZqJWQ-1wJZRYXTAmlDJlgbcrYaoIswQsuR6M61b30JU&s=10&texto=¡Hola%20${encodeURIComponent(nombre)}!&textodireccion=Centro&fontsize=70`;
  let edited_url = null;

  try {
    let resp = await fetch(apiUrl);
    let json = await resp.json();
    if (json.success && json.edited_url) edited_url = json.edited_url;
    else throw new Error('API no devolvió imagen');
  } catch (e) {
    console.error('Error con API miniatura:', e);
  }

  await global.menu(); // genera global.menutext

  let cap = global.menutext;
  let txt = `👋 ${ucapan()}, @${m.sender.split("@")[0]}!\n\n${cap}`;
  let mentions = conn.parseMention(txt);

  try {
    // Thumbnail emoji
    let imageBuffer;
    if (edited_url) {
      let fetchImg = await fetch(edited_url);
      imageBuffer = await fetchImg.buffer();
    } else {
      imageBuffer = await sharp('./src/doc_image.jpg')
        .resize(400, 400)
        .toBuffer();
    }

    let imgDoc = await fs.readFile("./src/menu.jpg");

    await conn.sendMessage(
      m.chat,
      {
        document: imgDoc,
        fileName: "✦ ʏᴜʀᴜ ʏᴜʀɪ ✧",
        mimetype: "image/png",
        caption: txt,
        fileLength: imgDoc.length,
        jpegThumbnail: imageBuffer,
        contextInfo: {
          mentionedJid: mentions,
          isForwarded: true,
          forwardingScore: 999,
          externalAdReply: {
            title: `✨ Hola ${nombre} ✨`,
            body: `✐ ${global.wm}`,
            thumbnail: imageBuffer,
            sourceUrl: "",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );

  } catch (e) {
    await conn.reply(m.chat, txt, m, { mentions: mentions });
    await conn.sendMessage(m.chat, `❎ Error mostrando menú: ${e.message}`, { quoted: m });
  }

  await global.menu();
};

handler.command = ["menu","help","menú","commands","comandos","?"];
export default handler;

function ucapan() {
  const h = parseInt(moment.tz("America/Lima").format("HH"));
  return h >= 18 ? "Good night." :
         h >= 15 ? "Good afternoon." :
         h >= 10 ? "Good morning." :
         h >= 4  ? "Good morning." :
                   "Hello.";
}
