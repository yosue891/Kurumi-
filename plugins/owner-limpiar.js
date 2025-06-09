import { existsSync, promises as fs, statSync } from 'fs';
import path from 'path';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const cleanFolder = async (folderPath) => {
  if (!existsSync(folderPath)) return { deleted: 0, size: 0 };

  const files = await fs.readdir(folderPath);
  let filesDeleted = 0;
  let totalSize = 0;

  for (const file of files) {
    if (file !== 'creds.json') {
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

  return { deleted: filesDeleted, size: totalSize };
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
    const folders = ['./Data/Sesiones/Principal/', './tmp'];
    let totalDeleted = 0;
    let totalSize = 0;

    for (const folder of folders) {
      const { deleted, size } = await cleanFolder(folder);
      totalDeleted += deleted;
      totalSize += size;
    }

    if (totalDeleted === 0) {
      await conn.sendMessage(
        m.chat,
        { text: 'ℹ️ No se encontraron archivos para eliminar.\nSolo se conserva "creds.json".' },
        { quoted: m }
      );
    } else {
      await conn.sendMessage(
        m.chat,
        {
          text: `✅ Eliminados: ${totalDeleted} archivo(s).\n` +
                `📦 Espacio liberado: ${formatSize(totalSize)}.\n` +
                `⚠️ "creds.json" fue preservado.`,
        },
        { quoted: m }
      );
    }
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    await conn.sendMessage(
      m.chat,
      { text: '❌ Error inesperado al limpiar archivos. Consulte los logs.' },
      { quoted: m }
    );
  }

  await conn.sendMessage(
    m.chat,
    { text: '📌 Para actualizar la sesión, puede enviar comandos adicionales.' },
    { quoted: m }
  );
};

handler.help = ['limpiar'];
handler.tags = ['owner'];
handler.command = /^limpiar$/i;
handler.rowner = true;

export default handler;