import fs from 'fs';
import path from 'path';

let handler = async (m, { conn: _conn, usedPrefix }) => {
  // Ruta base donde están las sesiones
  const basePath = './Data/Sesiones/Subbots/';

  // Leer todas las carpetas dentro de Subbots (cada carpeta corresponde a un subbot)
  let sesiones = [];
  if (fs.existsSync(basePath)) {
    sesiones = fs.readdirSync(basePath).filter(f => {
      // Solo carpetas con creds.json dentro
      return fs.existsSync(path.join(basePath, f, 'creds.json'));
    });
  }

  // Crear un listado con estado de conexión
  let listado = sesiones.map((user) => {
    // Buscar si el subbot está activo en global.conns por jid del usuario
    // El jid del subbot se suele formar como `${user}@s.whatsapp.net`
    const jid = `${user}@s.whatsapp.net`;
    const estaConectado = global.conns.some(c => c.user?.id === jid);
    return { user, conectado: estaConectado };
  });

  if (listado.length === 0) {
    return _conn.reply(m.chat, `❌ No hay sub bots activos o sesiones guardadas. Usa ${usedPrefix}cou para crear un sub bot.`, m);
  }

  // Construir mensaje
  let texto = `📡 *Sub Bots Activos y Sesiones Guardadas*\n\n`;
  texto += listado.map(({ user, conectado }, i) => 
    `*${i + 1}.* @${user} - ${conectado ? '🟢 Conectado' : '🔴 Desconectado'}`
  ).join('\n');

  await _conn.sendMessage(m.chat, { text: texto, mentions: listado.map(l => l.user + '@s.whatsapp.net') }, { quoted: m });
};

handler.help = ['bots'];
handler.command = ['bots'];
handler.rowner = false;

export default handler;