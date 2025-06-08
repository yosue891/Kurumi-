import fetch from 'node-fetch';
import sharp from 'sharp';
import { promises as fs } from 'fs';

let handler = async (m, { conn }) => {
  let nombre = await conn.getName(m.sender);
  let fileName = `✦ ʏᴜʀᴜ ʏᴜʀɪ ✧`;
  let cap = global.menutext || "Aquí está el menú uwu~ (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤";

  // Ruta de tu imagen base (la que quieres enviar como documento)
  let localImageBuffer = await fs.readFile("./src/menu.jpg");

  // Generar miniatura de ESA imagen (menor a 200KB)
  let miniThumbnail = await sharp(localImageBuffer)
    .resize(200, 200)
    .jpeg({ quality: 70 })
    .toBuffer();

  // Imagen de la API para el AdReply
  let adreplyImage = miniThumbnail; // fallback en caso de error

  try {
    const apiURL = `https://nightapi.is-a.dev/api/mayeditor?url=https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAoH2L-_2H07icZqJWQ-1wJZRYXTAmlDJlgbcrYaoIswQsuR6M61b30JU&s=10&texto=¡Hola%20${encodeURIComponent(nombre)}!&textodireccion=Centro&fontsize=70`;
    const res = await fetch(apiURL);
    const json = await res.json();
    if (json.success) {
      const imgRes = await fetch(json.edited_url);
      adreplyImage = await imgRes.buffer();
    }
  } catch (e) {
    console.warn("⚠️ Error al obtener miniatura de la API, se usa fallback");
  }

  // Enviar como documento con miniatura + adreply personalizada
  await conn.sendMessage(m.chat, {
    document: localImageBuffer,
    mimetype: "image/jpeg",
    fileName,
    caption: cap,
    jpegThumbnail: miniThumbnail,
    contextInfo: {
      externalAdReply: {
        title: `✨ Hola ${nombre} ✨`,
        body: `¡Holaaa! >w<`,
        thumbnail: adreplyImage,
        mediaType: 1,
        renderLargerThumbnail: true,
        sourceUrl: "https://github.com", // reemplaza si quieres
      },
    },
  }, { quoted: m });
};

handler.command = ["menu", "menú"];
export default handler;
