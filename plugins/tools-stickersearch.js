import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `✳️ Uso correcto: ${usedPrefix + command} <nombre_del_pack>`;

  const packName = args.join('_'); // ejemplos: Animals, Funny, Cats
  const apiUrl = `https://stickers.horner.tj/pack/${encodeURIComponent(packName)}`;

  await conn.sendMessage(m.chat, { text: `🔎 Buscando pack: *${args.join(' ')}*...` }, { quoted: m });

  try {
    const res = await fetch(apiUrl);
    if (res.status !== 200) throw new Error('Pack no encontrado');

    const data = await res.json();
    if (!data.stickers || !data.stickers.length) throw new Error('Sin stickers en el pack');

    // Información del pack
    const title = data.title || packName;
    const count = data.stickers.length;

    let reply = `⭐ *Pack encontrado:* ${title}\n🎫 *Stickers disponibles:* ${count}\n\nEnviando algunos...`;
    await conn.sendMessage(m.chat, { text: reply }, { quoted: m });

    // Envía hasta 8 stickers
    for (let i = 0; i < Math.min(8, count); i++) {
      const url = `https://stickers.horner.tj/sticker/${data.stickers[i]}.png`;
      await conn.sendFile(m.chat, url, 'sticker.png', '', m, { asSticker: true });
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: `⚠️ Error: ${e.message}` }, { quoted: m });
  }
};

handler.help = ['stickersearch <pack_name>'];
handler.tags = ['sticker'];
handler.command = ['stickersearch', 'stickerpack'];

export default handler;