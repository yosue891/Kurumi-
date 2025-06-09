const handler = async (m, { conn }) => {
  if (!global.subbots) {
    return m.reply('❌ No se encontró la lista de sub bots en memoria.');
  }

  const bots = Object.entries(global.subbots);
  if (bots.length === 0) return m.reply('🚫 No hay sub bots registrados.');

  let activos = [];
  let inactivos = [];

  for (const [id, sock] of bots) {
    if (sock?.ws?.readyState === 1) { // Estado 1 = Conectado
      activos.push(`✅ ${id}`);
    } else {
      inactivos.push(`❌ ${id}`);
    }
  }

  const mensaje = `
╭━━ ⭑ *Sub Bots Activos* ⭑ ━━╮
${activos.length ? activos.join('\n') : '🤖 Ninguno'}
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━ ⭑ *Sub Bots Inactivos* ⭑ ━━╮
${inactivos.length ? inactivos.join('\n') : '✅ Todos están activos'}
╰━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

  m.reply(mensaje);
};

handler.command = /^bots$/i;
handler.help = ['bots'];
handler.tags = ['info'];

export default handler;