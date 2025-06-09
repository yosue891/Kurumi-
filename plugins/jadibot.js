import fs from 'fs';

let handler = async (m, { conn: parent }) => {
  const basePath = './Data/Sesiones/Subbots/';
  if (!fs.existsSync(basePath)) {
    return parent.reply(m.chat, '❌ No hay sesiones de sub bots guardadas.', m);
  }

  let sesiones = fs.readdirSync(basePath).filter(name => fs.existsSync(`${basePath}${name}/creds.json`));

  if (!sesiones.length) {
    return parent.reply(m.chat, '❌ No hay sesiones de sub bots guardadas.', m);
  }

  let output = '📡 *Estado de Sub Bots*\n\n';
  let countActive = 0;
  let countInactive = 0;

  for (const user of sesiones) {
    try {
      const credsPath = `${basePath}${user}/creds.json`;
      const credsRaw = fs.readFileSync(credsPath, 'utf-8');
      const creds = JSON.parse(credsRaw);

      // Comprobación rápida para ver si tiene 'clientToken' y 'serverToken' (indicadores de sesión válida)
      if (creds.clientToken && creds.serverToken) {
        countActive++;
        output += `✅ @${user}\n`;
      } else {
        countInactive++;
        output += `❌ @${user}\n`;
      }
    } catch (e) {
      countInactive++;
      output += `❌ @${user}\n`;
    }
  }

  output += `\nTotal: ${sesiones.length} | Activos (con sesión válida): ${countActive} | Desconectados: ${countInactive}`;

  await parent.reply(m.chat, output.trim(), m, { mentions: sesiones.map(u => `${u}@s.whatsapp.net`) });
};

handler.help = ['bots'];
handler.command = ['bots'];
handler.rowner = false;

export default handler;