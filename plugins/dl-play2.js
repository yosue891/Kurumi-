import fetch from 'node-fetch';

let handler = async (m, { conn: star, usedPrefix, command, text }) => {
  if (!text) {
    return star.reply(
      m.chat,
      `*✎ ¡Ingresa el texto o enlace del vídeo de YouTube!*\n\n» *Ejemplo:*\n> *${usedPrefix + command}* crow edits`,
      m
    );
  }

  await m.react('🕓');

  try {
    // Buscar video en YouTube
    let api = await (await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${text}`)).json();
    let result = api.data[0];

    let { title, duration, url, publishedAt, image } = result;

    // Decoración estilo bonito
    let txt = `*「✦」 » ${title}*\n\n`;
    txt += `> ⏳ Duración » ${duration}\n`;
    txt += `> ✐ Publicación » ${publishedAt}\n`;
    txt += `> 🜸 Link » ${url}`;

    await star.sendFile(m.chat, image, 'thumb.jpg', txt, m);

    // Descargar usando API de Sylphy
    let res = await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${url}&apikey=sylph-da68348310`);
    let json = await res.json();

    if (!json || !json.data || !json.data.url) {
      await m.react('✖️');
      return star.reply(m.chat, '✦ *Error al obtener el video desde la API de Sylphy.*', m);
    }

    let downloadUrl = json.data.url;

    await star.sendMessage(
      m.chat,
      {
        document: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `> Video solicitado`,
      },
      { quoted: m }
    );

    await m.react('✅');
  } catch (e) {
    console.error(e);
    await m.react('✖️');
    star.reply(m.chat, '✦ Ocurrió un error al procesar tu solicitud.', m);
  }
};

handler.command = ['pvideo', 'play2'];

export default handler;