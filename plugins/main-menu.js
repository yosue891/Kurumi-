import fetch from 'node-fetch';
import sharp from 'sharp';
import { promises as fs } from 'fs';

let handler = async (m, { conn }) => {
  let nombre = await conn.getName(m.sender);
  let fileName = `✦ ʏᴜʀᴜ ʏᴜʀɪ ✧`;
  let cap = global.menutext || "Aquí está el menú uwu~ (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤";

  // API personalizada
  let apiURL = `https://nightapi.is-a.dev/api/mayeditor?url=https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAoH2L-_2H07icZqJWQ-1wJZRYXTAmlDJlgbcrYaoIswQsuR6M61b30JU&s=10&texto=¡Hola%20${encodeURIComponent(nombre)}!&textodireccion=Centro&fontsize=70`;

  let imageBuffer;

  try {
    let res = await fetch(apiURL);
    let json = await res.json();
    if (json.success) {
      const imgRes = await fetch(json.edited_url);
      imageBuffer = await imgRes.buffer();
    }
  } catch (e) {
    console.error("❌ Error en la API de miniatura:", e);
    imageBuffer = await fs.readFile("./src/menu.jpg");
  }

  // Generar miniatura optimizada (JPEG, <200kb)
  let miniThumbnail = await sharp(imageBuffer)
    .resize(200, 200)
    .jpeg({ quality: 70 })
    .toBuffer();

  // Enviar como imagen-documento con miniatura
  await conn.sendMessage(m.chat, {
    document: imageBuffer,
    mimetype: "image/jpeg",
    fileName,
    caption: cap,
    jpegThumbnail: miniThumbnail,
    contextInfo: {
      externalAdReply: {
        title: `✨ Hola ${nombre} ✨`,
        body: `Menu personalizado 😎`,
        thumbnail: miniThumbnail,
        mediaType: 1,
        renderLargerThumbnail: true,
        sourceUrl: "https://github.com", // tu página o repositorio si quieres
      },
    },
  }, { quoted: m });
};

handler.command = ["menu", "menú"];
export default handler;
