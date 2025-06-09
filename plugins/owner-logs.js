import { readFileSync, existsSync } from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
  const logFilePath = path.resolve('./logs/bot.log');

  await conn.sendMessage(m.chat, { text: '📄 *Extrayendo las últimas líneas del archivo de logs...*' }, { quoted: m });

  try {
    if (!existsSync(logFilePath)) {
      return await conn.sendMessage(m.chat, { text: '❌ No se encontró el archivo de logs en la ruta configurada.' }, { quoted: m });
    }

    const logContent = readFileSync(logFilePath, 'utf-8');
    const lines = logContent.trim().split('\n');
    const lastLines = lines.slice(-30).join('\n');

    const response = `📋 *Últimas 30 líneas del archivo de logs*\n\n\`\`\`\n${lastLines}\n\`\`\``;

    await conn.sendMessage(m.chat, { text: response }, { quoted: m });

  } catch (error) {
    console.error('Error al leer el archivo de logs:', error);
    await conn.sendMessage(m.chat, { text: '⚠️ Ocurrió un error al intentar leer el archivo de logs.' }, { quoted: m });
  }
};

handler.help = ['logs'];
handler.tags = ['owner']
handler.command = /^logs$/i;

export default handler;