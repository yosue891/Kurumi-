import fs from 'fs';
import path from 'path';

let handler = async (m, { conn: _conn, usedPrefix }) => {
  const basePath = './Data/Sesiones/Subbots/';

  if (!fs.existsSync(basePath)) {
    return _conn.reply(m.chat, '❌ No hay sesiones de sub bots para borrar.', m);
  }

  // Leer todas las carpetas que tengan creds.json
  let sesiones = fs.readdirSync(basePath).filter(f => {
    return fs.existsSync(path.join(basePath, f, 'creds.json'));
  });

  if (sesiones.length === 0) {
    return _conn.reply(m.chat, '❌ No se encontraron sesiones de sub bots.', m);
  }

  // Filtrar las sesiones que NO están conectadas en global.conns
  let sesionesParaBorrar = sesiones.filter(user => {
    const jid = `${user}@s.whatsapp.net`;
    return !global.conns.some(c => c.user?.id === jid);
  });

  if (sesionesParaBorrar.length === 0) {
    return _conn.reply(m.chat, '⚠️ Todas las sesiones de sub bots están conectadas, no hay nada que borrar.', m);
  }

  // Borrar carpetas de sesiones no conectadas
  let borrados = [];
  for (const user of sesionesParaBorrar) {
    const ruta = path.join(basePath, user);
    try {
      fs.rmSync(ruta, { recursive: true, force: true });
      borrados.push(user);
    } catch (e) {
      console.error(`Error borrando sesión de ${user}:`, e);
    }
  }

  _conn.reply(m.chat, `🗑️ Se borraron las sesiones de sub bots no conectados:\n\n${borrados.map(u => `- @${u}`).join('\n')}`, m, { mentions: borrados.map(u => u + '@s.whatsapp.net') });
};

handler.help = ['cleansub'];
handler.command = ['clearsubs'];
handler.rowner = false;

export default handler;