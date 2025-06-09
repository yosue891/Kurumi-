import { existsSync, promises as fs, statSync } from 'fs';
import path from 'path';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

// Limpia archivos en carpeta, preservando los listados en keepFiles
const cleanFolder = async (folderPath, keepFiles = ['creds.json']) => {
  if (!existsSync(folderPath)) return { deleted: 0, size: 0 };

  const files = await fs.readdir(folderPath);
  let filesDeleted = 0;
  let totalSize = 0;

  for (const file of files) {
    if (!keepFiles.includes(file)) {
      const filePath = path.join(folderPath, file);
      try {
        const stats = statSync(filePath);
        totalSize += stats.size;
        await fs.unlink(filePath);
        filesDeleted++;
      } catch (error) {
        console.error(`Error eliminando archivo ${filePath}:`, error);
      }
    }
  }

  return { deleted: filesDeleted, size: totalSize, preserved: files.filter(f => keepFiles.includes(f)) };
};

const handler = async (m, { conn }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(
      m.chat,
      { text: '⚠️ Este comando solo puede ejecutarlo el número principal del bot.' },
      { quoted: m }
    );
  }

  await conn.sendMessage(
    m.chat,
    { text: '🧹 Iniciando limpieza de archivos de sesión y temporales...' },
    { quoted: m }
  );

  try {
    let totalDeleted = 0;
    let totalSize = 0;

    let report = '';

    // Limpieza carpeta Principal
    const principalPath = './Data/Sesiones/Principal/';
    const { deleted: deletedPrincipal, size: sizePrincipal, preserved: preservedPrincipal } = await cleanFolder(principalPath, ['creds.json']);
    totalDeleted += deletedPrincipal;
    totalSize += sizePrincipal;
    report += `📁 Carpeta Principal:\n  - Archivos eliminados: ${deletedPrincipal}\n  - Espacio liberado: ${formatSize(sizePrincipal)}\n  - Archivos preservados: ${preservedPrincipal.join(', ') || 'Ninguno'}\n\n`;

    // Limpieza carpeta tmp
    const tmpPath = './tmp';
    const { deleted: deletedTmp, size: sizeTmp, preserved: preservedTmp } = await cleanFolder(tmpPath);
    totalDeleted += deletedTmp;
    totalSize += sizeTmp;
    report += `📁 Carpeta tmp:\n  - Archivos eliminados: ${deletedTmp}\n  - Espacio liberado: ${formatSize(sizeTmp)}\n  - Archivos preservados: ${preservedTmp.join(', ') || 'Ninguno'}\n\n`;

    // Limpieza Subbots
    const subbotsPath = './Data/Sesiones/Subbots/';
    if (existsSync(subbotsPath)) {
      const subbotFolders = await fs.readdir(subbotsPath);
      if (subbotFolders.length === 0) {
        report += '📁 Carpeta Subbots está vacía.\n\n';
      } else {
        report += '📁 Carpeta Subbots:\n';
        for (const folder of subbotFolders) {
          const folderPath = path.join(subbotsPath, folder);
          const stats = await fs.stat(folderPath);
          if (stats.isDirectory()) {
            const keepFiles = ['creds.json', 'session.json'];
            const { deleted, size, preserved } = await cleanFolder(folderPath, keepFiles);
            totalDeleted += deleted;
            totalSize += size;
            report += `  - Subbot "${folder}":\n    * Archivos eliminados: ${deleted}\n    * Espacio liberado: ${formatSize(size)}\n    * Archivos preservados: ${preserved.join(', ') || 'Ninguno'}\n`;
          }
        }
        report += '\n';
      }
    } else {
      report += '📁 Carpeta Subbots no existe.\n\n';
    }

    if (totalDeleted === 0) {
      await conn.sendMessage(
        m.chat,
        { text: 'ℹ️ No se encontraron archivos para eliminar. Todos los archivos esenciales están preservados.' },
        { quoted: m }
      );
    } else {
      await conn.sendMessage(
        m.chat,
        {
          text: `✅ Limpieza finalizada con éxito:\n\n${report}📊 Resumen total:\n  - Archivos eliminados: ${totalDeleted}\n  - Espacio liberado: ${formatSize(totalSize)}\n\n⚠️ Archivos esenciales para sesiones fueron preservados.`,
        },
        { quoted: m }
      );
    }
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    await conn.sendMessage(
      m.chat,
      { text: '❌ Error inesperado al limpiar archivos. Por favor, revisa los logs.' },
      { quoted: m }
    );
  }

  await conn.sendMessage(
    m.chat,
    { text: '📌 Para refrescar la sesión, puedes enviar comandos adicionales o reiniciar el bot si es necesario.' },
    { quoted: m }
  );
};

handler.help = ['limpiar'];
handler.tags = ['owner'];
handler.command = /^limpiar$/i;
handler.rowner = true;

export default handler;