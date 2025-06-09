import { existsSync, promises as fs, statSync } from 'fs';
import path from 'path';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const handler = async (m, { conn }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(m.chat, {
      text:
        '🚫 *Acceso Denegado*\n\n' +
        'Este comando está reservado exclusivamente para el número principal del bot.\n' +
        'Por favor, utilícelo desde la cuenta autorizada.',
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text:
      '🔄 *Inicio del Proceso de Limpieza*\n\n' +
      'Se procederá a eliminar archivos temporales y de sesión innecesarios, preservando únicamente los archivos esenciales para el funcionamiento.\n' +
      'Por favor, espere...',
  }, { quoted: m });

  const targets = [
    { path: './tmp', exclude: [] },
    { path: './Data/Sesiones/Principal', exclude: ['creds.json'] },
    { path: './Data/Sesiones/Subbots', exclude: ['creds.json'] }
  ];

  let totalDeletedFiles = 0;
  let totalFreedSpace = 0;
  let detailedLog = '';

  for (const { path: folderPath, exclude } of targets) {
    if (!existsSync(folderPath)) {
      detailedLog += `⚠️ Carpeta no encontrada o vacía: ${folderPath}\n\n`;
      continue;
    }

    try {
      const files = await fs.readdir(folderPath);
      let deletedFilesCount = 0;
      let freedSpaceBytes = 0;

      for (const file of files) {
        if (!exclude.includes(file)) {
          const fullPath = path.join(folderPath, file);
          const stats = statSync(fullPath);

          if (stats.isFile()) {
            await fs.unlink(fullPath);
            deletedFilesCount++;
            freedSpaceBytes += stats.size;
          }
        }
      }

      totalDeletedFiles += deletedFilesCount;
      totalFreedSpace += freedSpaceBytes;

      if (deletedFilesCount > 0) {
        detailedLog +=
          `✅ Limpieza exitosa en: ${folderPath}\n` +
          `• Archivos eliminados: ${deletedFilesCount}\n` +
          `• Espacio liberado: ${formatSize(freedSpaceBytes)}\n\n`;
      } else {
        detailedLog += `ℹ️ No se eliminaron archivos en: ${folderPath}\n\n`;
      }
    } catch (error) {
      detailedLog += `❌ Error procesando ${folderPath}: ${error.message}\n\n`;
    }
  }

  if (totalDeletedFiles === 0) {
    await conn.sendMessage(m.chat, {
      text:
        '🔔 *Proceso de Limpieza Finalizado*\n\n' +
        'No se encontraron archivos que requieran eliminación.\n' +
        'Todos los archivos esenciales permanecen intactos para asegurar la estabilidad del bot.',
    }, { quoted: m });
  } else {
    await conn.sendMessage(m.chat, {
      text:
        '✅ *Proceso de Limpieza Completado*\n\n' +
        `• Total de archivos eliminados: ${totalDeletedFiles}\n` +
        `• Espacio total liberado: ${formatSize(totalFreedSpace)}\n\n` +
        'Detalle por carpeta:\n' +
        '────────────────────────────\n' +
        detailedLog +
        '────────────────────────────\n' +
        '📌 Se conservaron todos los archivos imprescindibles para el funcionamiento correcto del bot.',
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text:
      '🔹 Para actualizar el estado, envíe cualquier comando.\n' +
      '🔹 Bot optimizado y funcionando en óptimas condiciones.',
  }, { quoted: m });
};

handler.help = ['limpiar'];
handler.tags = ['owner'];
handler.command = /^limpiar$/i;
handler.rowner = true;

export default handler;