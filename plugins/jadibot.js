import fs from 'fs';
import pino from 'pino';
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } from '@whiskeysockets/baileys';
import { makeWASocket } from '../lib/simple.js';

async function testConnection(sessionPath) {
  return new Promise(async (resolve) => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      const { version } = await fetchLatestBaileysVersion();

      const conn = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
        },
        version,
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
      });

      // Timeout para no esperar demasiado
      const timeout = setTimeout(() => {
        conn.ev.removeAllListeners();
        conn.ws.close();
        resolve(false);
      }, 7000);

      conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
          clearTimeout(timeout);
          conn.ev.removeAllListeners();
          conn.ws.close();
          resolve(true);
        } else if (connection === 'close') {
          clearTimeout(timeout);
          conn.ev.removeAllListeners();
          conn.ws.close();
          resolve(false);
        }
      });

      // En caso de error inmediato
      conn.ev.on('creds.update', () => saveCreds());

    } catch (e) {
      resolve(false);
    }
  });
}

let handler = async (m, { conn: parent }) => {
  const basePath = './Data/Sesiones/Subbots/';
  if (!fs.existsSync(basePath)) {
    return parent.reply(m.chat, '❌ No hay sesiones de sub bots guardadas.', m);
  }

  let sesiones = fs.readdirSync(basePath).filter(name => fs.existsSync(`${basePath}${name}/creds.json`));

  if (!sesiones.length) {
    return parent.reply(m.chat, '❌ No hay sesiones de sub bots guardadas.', m);
  }

  await parent.reply(m.chat, '⏳ Comprobando sesiones de sub bots, espera un momento...', m);

  let output = '📡 *Estado de Sub Bots (Reconexión Fake)*\n\n';
  let countActive = 0;
  let countInactive = 0;

  for (const user of sesiones) {
    const sessionPath = `${basePath}${user}`;
    const activo = await testConnection(sessionPath);

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