const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  if (typeof usedPrefix === 'string' && usedPrefix.toLowerCase() === 'a') return;

  const customEmoji = global.db.data.chats[m.chat]?.customEmoji || '🌟';
  m.react(customEmoji);

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const mensajePersonalizado = args.length ? args.join(' ') : 'Les hago una cordial invitación a todos los miembros del grupo para participar activamente.';
  const totalMiembros = participants.length;

  let texto = `📢 *NOTIFICACIÓN GENERAL* 📢\n\n`;
  texto += `👥 *Para ${totalMiembros} miembros*\n\n`;
  texto += `📝 *Mensaje:* ${mensajePersonalizado}\n\n`;
  texto += `──────────────────────────────\n`;
  texto += `🔔 ${customEmoji} Invitación enviada por *${global.botname || 'el bot'}*\n\n`;

  for (const miembro of participants) {
    texto += `➥ ${customEmoji} @${miembro.id.split('@')[0]}\n`;
  }

  texto += `──────────────────────────────\n`;
  texto += `🛡️ *Versión:* ${global.vs || '1.0.0'}\n`;
  texto += `🤖 *¡Gracias por ser parte de esta comunidad!*`;

  await conn.sendMessage(m.chat, { text: texto, mentions: participants.map(a => a.id) }, { quoted: m });
};

handler.help = ['todos *<mensaje opcional>*'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall'];
handler.admin = true;
handler.group = true;

export default handler;