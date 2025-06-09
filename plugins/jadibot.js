const handler = async (m, { conn }) => {
  if (!global.subbots || typeof global.subbots !== 'object') {
    return m.reply('❌ No hay sub bots registrados.');
  }

  const bots = Object.entries(global.subbots);
  if (!bots.length) return m.reply('🤖 No hay sub bots activos en memoria.');

  let activos = [];
  let inactivos = [];
  let debug = [];

  for (const [id, sock] of bots) {
    // Detectar si está activo
    let isActivo = false;
    
    if (sock?.ws?.readyState === 1) {
      isActivo = true;
    } else if (typeof sock?.ev === 'object') {
      isActivo = true;
    } else if (typeof sock?.sendPresenceUpdate === 'function') {
      isActivo = true;
    }

    if (isActivo) {
      activos.push(`✅ ${id}`);
    } else {
      inactivos.push(`❌ ${id}`);
    }

    debug.push(`🧩 Bot: ${id}
- ws: ${!!sock?.ws}
- ws.readyState: ${sock?.ws?.readyState}
- ev: ${!!sock?.ev}
- sendPresenceUpdate: ${typeof sock?.sendPresenceUpdate === 'function'}
`);
  }

  const mensaje = `
╭━━ ⭑ *Sub Bots Activos* ⭑ ━━╮
${activos.join('\n') || '🤖 Ninguno'}
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━ ⭑ *Sub Bots Inactivos* ⭑ ━━╮
${inactivos.join('\n') || '✅ Todos están activos'}
╰━━━━━━━━━━━━━━━━━━━━━━╯

📊 *Debug técnico:*
${debug.join('\n')}
`.trim();

  m.reply(mensaje);
};

handler.command = /^bots$/i;
export default handler;