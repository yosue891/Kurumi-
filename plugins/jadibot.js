const handler = async (m, { conn }) => {
  if (!global.subbots || typeof global.subbots !== 'object') {
    return m.reply('❌ No hay sub bots registrados.');
  }

  const bots = Object.entries(global.subbots);
  if (!bots.length) return m.reply('🤖 No hay sub bots activos en memoria.');

  let activos = [];
  let inactivos = [];

  for (const [id, sock] of bots) {
    let isActivo = (typeof sock?.ev === 'object') && (typeof sock?.sendPresenceUpdate === 'function');
    
    if (isActivo) {
      activos.push(`✅ ${id}`);
    } else {
      inactivos.push(`❌ ${id}`);
    }
  }

  const mensaje = `
╭━━ ⭑ *Sub Bots Activos* ⭑ ━━╮
${activos.join('\n') || '🤖 Ninguno'}
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━ ⭑ *Sub Bots Inactivos* ⭑ ━━╮
${inactivos.join('\n') || '✅ Todos están activos'}
╰━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();

  m.reply(mensaje);
};

handler.command = /^bots$/i;
export default handler;