import cheerio from "cheerio";
import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `🌸 *Uso correcto:* ${usedPrefix + command} gatos`;

  const res = await axios.get(`https://getstickerpack.com/stickers?query=${encodeURIComponent(text)}`);
  const $ = cheerio.load(res.data);
  const packs = [];

  $("a.sticker-pack__name").each((_, el) => {
    const url = "https://getstickerpack.com" + $(el).attr("href");
    const name = $(el).text().trim();
    packs.push({ name, url });
  });

  if (!packs.length) throw `❌ No se encontraron stickers relacionados con *${text}*`;

  let selected = packs[0];
  const html = await axios.get(selected.url);
  const $$ = cheerio.load(html.data);
  const links = [];

  $$(".sticker-pack__images img").each((_, el) => {
    const link = $$(el).attr("src");
    if (link && link.includes("/stickers/")) links.push(link);
  });

  if (!links.length) throw "⚠ No se pudieron obtener imágenes del paquete.";

  let msg = `*🌸 Resultado de búsqueda:* ${selected.name}\n\n`;
  msg += `💫 Stickers encontrados: ${links.length}\n`;
  msg += `🔗 Enlace: ${selected.url}`;

  await conn.sendMessage(m.chat, { text: msg }, { quoted: m });

  for (let i = 0; i < Math.min(8, links.length); i++) {
    await conn.sendImageAsSticker(m.chat, links[i], m, {
      packname: "StickerSearch",
      author: "MaiBot"
    });
    await new Promise(res => setTimeout(res, 1000)); // evita spam masivo
  }
};

handler.help = ["stickersearch <tema>"];
handler.tags = ["sticker"];
handler.command = ["stickersearch", "buscarsticker", "stickersde"]; // alias opcionales

export default handler;