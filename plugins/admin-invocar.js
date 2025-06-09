const handler = async (m, { conn, participants }) => {
  const isGroup = m.chat.endsWith('@g.us'); // Detecta si es grupo

  if (!isGroup) {
    return await conn.sendMessage(m.chat, { text: '❗ Este comando solo puede usarse dentro de un grupo.' }, { quoted: m });
  }

  try {
    const mentions = participants.map(user => user.id);
    const messageText = `🔥 *${wm}* los invoca, presentense pinchis guapos 🔥\n\n`;

    await conn.sendMessage(m.chat, {
      text: messageText,
      mentions
    }, { quoted: m });

  } catch (error) {
    console.error('Error al invocar miembros:', error);
    await conn.sendMessage(m.chat, { text: '⚠️ Ocurrió un error al invocar a los miembros del grupo.' }, { quoted: m });
  }
};

handler.help = ['invocar'];
handler.tags = ['group'];
handler.command = /^invocar$/i;
handler.group = true;

export default handler;