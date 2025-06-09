import fs from "fs";

let handlerDelsesion = async (m, { conn, usedPrefix }) => {
  let userId = m.sender.split('@')[0];
  let userFolderPath = `./Data/Sesiones/Subbots/${userId}`;

  if (!fs.existsSync(userFolderPath)) {
    return m.reply(`❌ *No tienes ninguna sesión activa.*\n\nUsa *${usedPrefix}cou* para crear una nueva.`);
  }

  try {
    fs.rmSync(userFolderPath, { recursive: true, force: true });
    await m.reply(`✅ *Tu sesión fue eliminada exitosamente.*\n\nYa puedes usar *${usedPrefix}cou* para crear un nuevo sub bot.`);
  } catch (err) {
    console.error(err);
    await m.reply(`⚠️ *Hubo un error al eliminar tu sesión.*`);
  }
};

handlerDelsesion.help = ['delsesion'];
handlerDelsesion.command = ['delsesion'];
handlerDelsesion.rowner = false;

export default handlerDelsesion;