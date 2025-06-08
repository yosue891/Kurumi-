import fetch from 'node-fetch';
import yts from 'yt-search';

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`🍭 Ingrese el nombre de un video\n> *Ejemplo:* ${command} un verano sin ti`);

  m.react(rwait);

  try {
    // Buscar video en YouTube usando yt-search
    let search = await yts(text);
    let vid = search.videos[0];

    if (!vid) return m.reply('❌ No se encontró ningún video. Prueba con otro nombre.');

    let { title, timestamp, views, url, ago, author, image } = vid;

    // Enviar detalles del video
    await conn.sendMessage(m.chat, {
      image: { url: image },
      caption: `
🎬 *Título:* ${title}
⏱️ *Duración:* ${timestamp}
📆 *Publicado:* ${ago}
📊 *Vistas:* ${views.toLocaleString()}
👤 *Canal:* ${author.name}
🔗 *Link:* ${url}

⌛ *Descargando video en calidad 480p...*`,
    }, { quoted: m });

    // Intentar descargar desde varias APIs
    let video;
    try {
      video = await (await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=480p&apikey=GataDios`)).json();
    } catch (e1) {
      try {
        video = await (await fetch(`https://api.fgmods.xyz/api/downloader/ytmp4?url=${url}&quality=480p&apikey=be9NqGwC`)).json();
      } catch (e2) {
        try {
          video = await (await fetch(`https://api.alyachan.dev/api/ytv?url=${url}&apikey=uXxd7d`)).json();
        } catch (e3) {
          video = await (await fetch(`https://good-camel-seemingly.ngrok-free.app/download/mp4?url=${url}`)).json();
        }
      }
    }

    let link = video?.data?.url || video?.download_url || video?.result?.dl_url || video?.downloads?.link?.[0];
    if (!link) throw 'No se pudo obtener el enlace del video.';

    await conn.sendMessage(m.chat, {
      video: { url: link },
      mimetype: "video/mp4",
      caption: `✅ *Descarga completada*\n📥 *${title}*`,
    }, { quoted: m });

    m.react(done);

  } catch (e) {
    console.error(e);
    m.reply('❌ Hubo un error al procesar tu solicitud. Intenta nuevamente con otro nombre.');
    m.react('❗');
  }
};

handler.command = ['play2'];
export default handler;