import { existsSync, promises as fs, statSync } from 'fs';
import path from 'path';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const cleanFolder = async (folderPath, excludeFiles = []) => {
  if (!existsSync(folderPath)) return { deletedFiles: 0, freedBytes: 0, error: `⚠️ La carpeta ${folderPath} no existe.` };

  let deletedFiles = 0;
  let freedBytes = 0;

  try {
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      if (excludeFiles.includes(file)) continue;

      const fullPath = path.join(folderPath, file);
      const stats = statSync(fullPath);
      if (stats.isFile()) {
        await fs.unlink(fullPath);
        deletedFiles++;
        freedBytes += stats.size;
      }
    }
    return { deletedFiles, freedBytes, error: null };
  } catch (e) {
    return { deletedFiles: 0, freedBytes: 0, error: `❌ Error limpiando ${folderPath}: ${e.message}` };
  }
};

const handler = async (m, { conn }) => {
  const jidBot = conn.user.jid;
  const jidMain = global.conn.user.jid;

  // Permitimos ejecutar solo en principal o subbots (cualquier subcarpeta en ./Data/Sesiones/Subbots)
  const isMainBot = jidBot === jidMain;
  const subbotsBase = './Data/Sesiones/Subbots/';
  const isSubbot = jidBot.startsWith(jidMain.split('@')[0]) === false && existsSync(subbotsBase) && (await fs.readdir(subbotsBase)).some(folder => jidBot.startsWith(folder));

  // Alternativa más simple: si no es principal, asumimos subbot y limpiamos su carpeta si existe.
  // O mejor: si no principal, limpiamos tmp + ./Data/Sesiones/Subbots/[número-del-jid]/ si existe

  // Extraemos número del jid para subbot
  const jidNumber = jidBot.split('@')[0];
  const subbotPath = path.join(subbotsBase, jidNumber);

  // Enviar mensaje inicial
  await conn.sendMessage(m.chat, {
    text:
      '🧹 *Iniciando Limpieza Avanzada de Sesiones*\n\n' +
      '➤ Se eliminarán archivos temporales y de sesión innecesarios para liberar espacio y optimizar el funcionamiento.\n' +
      '➤ Los archivos esenciales, como "creds.json", serán preservados.\n' +
      '⏳ Por favor, espere un momento...',
  }, { quoted: m });

  let report = '';

  // Siempre limpiar ./tmp (excepto si quieres excluir algo ahí, acá borramos todo)
  const tmpClean = await cleanFolder('./tmp');
  if (tmpClean.error) {
    report += `${tmpClean.error}\n\n`;
  } else {
    report += `✅ Carpeta ./tmp limpiada\n• Archivos eliminados: ${tmpClean.deletedFiles}\n• Espacio liberado: ${formatSize(tmpClean.freedBytes)}\n\n`;
  }

  if (isMainBot) {
    // Limpiar carpeta Principal
    const principalClean = await cleanFolder('./Data/Sesiones/Principal', ['creds.json']);
    if (principalClean.error) {
      report += `${principalClean.error}\n\n`;
    } else {
      report += `✅ Carpeta ./Data/Sesiones/Principal limpiada\n• Archivos eliminados: ${principalClean.deletedFiles}\n• Espacio liberado: ${formatSize(principalClean.freedBytes)}\n\n`;
    }

    // Limpiar todas las subcarpetas en ./Data/Sesiones/Subbots
    if (existsSync(subbotsBase)) {
      const subFolders = await fs.readdir(subbotsBase);
      if (subFolders.length === 0) {
        report += `ℹ️ No se encontraron subbots en ${subbotsBase}\n\n`;
      } else {
        for (const folder of subFolders) {
          const folderPath = path.join(subbotsBase, folder);
          const cleanRes = await cleanFolder(folderPath, ['creds.json']);
          if (cleanRes.error) {
            report += `${cleanRes.error}\n\n`;
          } else {
            report += `✅ Subbot ${folder} limpiado\n• Archivos eliminados: ${cleanRes.deletedFiles}\n• Espacio liberado: ${formatSize(cleanRes.freedBytes)}\n\n`;
          }
        }
      }
    } else {
      report += `ℹ️ Carpeta de subbots no existe: ${subbotsBase}\n\n`;
    }
  } else {
    // Subbot: limpiar solo su carpeta de sesión + ./tmp
    if (existsSync(subbotPath)) {
      const subbotClean = await cleanFolder(subbotPath, ['creds.json']);
      if (subbotClean.error) {
        report += `${subbotClean.error}\n\n`;
      } else {
        report += `✅ Carpeta de sesión del subbot (${jidNumber}) limpiada\n• Archivos eliminados: ${subbotClean.deletedFiles}\n• Espacio liberado: ${formatSize(subbotClean.freedBytes)}\n\n`;
      }
    } else {
      report += `ℹ️ Carpeta de sesión para subbot ${jidNumber} no existe: ${subbotPath}\n\n`;
    }
  }

  report += '✔️ *Limpieza completada con éxito.*\n';

  // Enviar reporte final
  await conn.sendMessage(m.chat, { text: report.trim() }, { quoted: m });
};

handler.help = ['limpiar', 'cleanallsession', 'dsowner'];
handler.tags = ['owner'];
handler.command = /^(limpiar|cleanallsession|del_reg_in_session_owner|dsowner|clearallsession)$/i;
handler.rowner = true;

export default handler;