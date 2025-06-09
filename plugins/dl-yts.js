import yts from 'yt-search';

let handler = async (m, { conn, text }) => {
  if (!text) throw `✳️ Ingresa el título de un video de YouTube.`;

  let results = await yts(text);
  let videos = results.videos.slice(0, 8); // Limita resultados para no saturar

  let listado = videos.map((v, i) => `
${i + 1}. 🎬 *${v.title}*
╭───────────────
│⏱️ *Duración:* ${v.timestamp}
│📅 *Publicado:* ${v.ago}
│👁️ *Vistas:* ${v.views.toLocaleString()}
│🔗 *Enlace:* ${v.url}
╰───────────────
  `.trim()).join('\n');

  let caption = `\`\`\`🔍 RESULTADOS DE BÚSQUEDA\`\`\`\n\n${listado}`;
  await conn.sendFile(m.chat, videos[0].image, 'yts.jpeg', caption, m);
};

handler.help = ['ytsearch'];
handler.tags = ['download'];
handler.command = ['ytsearch', 'yts'];

export default handler;