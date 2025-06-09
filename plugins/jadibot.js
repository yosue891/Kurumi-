import fs from 'fs';
import ws from 'ws';
const { CONNECTING, OPEN } = ws;

function isConnActive(conn, user) {
  if (!conn.user || !conn.user.id) return false;

  const userId = user.toLowerCase();
  const connId = conn.user.id.toLowerCase();

  // Compara solo la parte antes de '@'
  const connNumber = connId.split('@')[0];
  const userNumber = userId.split('@')[0];

  if (connNumber !== userNumber) return false;

  // Verifica que el WebSocket esté abierto o conectando y que isInit sea true
  if (conn.ws && (conn.ws.readyState === OPEN || conn.ws.readyState === CONNECTING) && conn.isInit) {
    return true;
  }

  return false;
}

let handler = async (m, { conn: parent }) => {
  const basePath = './Data/Sesiones/Subbots/';

  if (!fs.existsSync(basePath)) {
    return parent.reply(m.chat, '❌ No hay sesiones de sub bots guardadas.', m);
  }

  let sesiones = fs.readdirSync(basePath).filter(name => {
    return fs.existsSync(`${basePath}${name}/creds.json`);
  });

  if (!sesiones.length) {
    return parent.reply(m.chat, '❌ No hay sesiones de sub bots guardadas.', m);
  }

  let output = '📡 *Sub Bots Activos*\n\n';

  let countActive = 0;
  let countInactive = 0;

  for (let user of sesiones) {
    let jid = `${user}@s.whatsapp.net`;
    let activo = global.conns.some(conn => isConnActive(conn, jid));
    if (activo) {
      countActive++;
      output += `✅ @${user}\n`;
    } else {
      countInactive++;
      output += `❌ @${user}\n`;
    }
  }

  output += `\nTotal: ${sesiones.length} | Activos: ${countActive} | Desconectados: ${countInactive}`;

  await parent.reply(m.chat, output.trim(), m, { mentions: sesiones.map(u => `${u}@s.whatsapp.net`) });
};

handler.help = ['bots'];
handler.command = ['bots'];
handler.rowner = false;

export default handler;