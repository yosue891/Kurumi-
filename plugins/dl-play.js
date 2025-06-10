import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import { getAverageColor } from "fast-average-color-node";

const formatAudio = ["mp3", "m4a", "webm", "acc", "flac", "opus", "ogg", "wav"];
const formatVideo = ["360", "480", "720", "1080", "1440", "4k"];
const limit = 100;

const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
      throw new Error("⚠ Formato no soportado.");
    }

    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: { "User-Agent": "Mozilla/5.0" }
    };

    const response = await axios.request(config);
    if (response.data?.success) {
      const { id, title, info } = response.data;
      const downloadUrl = await ddownr.cekProgress(id);
      return { title, downloadUrl, image: info.image };
    } else {
      throw new Error("⛔ No se pudo obtener detalles.");
    }
  },

  cekProgress: async (id) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: { "User-Agent": "Mozilla/5.0" }
    };

    while (true) {
      const res = await axios.request(config);
      if (res.data?.success && res.data.progress === 1000) {
        return res.data.download_url;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply("✧ Ingresa el nombre de un video o URL de YouTube.");
  await m.react("🕛");

  const res = await yts(text);
  if (!res.all.length) return m.reply("⛔ No se encontraron resultados.");

  const video = res.all[0];
  const total = Number(video.duration.seconds) || 60;
  const current = Math.floor(Math.random() * (total - 30 + 1)) + 30;

  const thumbnail = await create(video.thumbnail, {
    title: video.title,
    author: video.author.name,
    duration: video.duration.timestamp,
    views: video.views.toLocaleString(),
    current,
    total
  });

  await conn.sendFile(m.chat, thumbnail, "thumb.jpg", undefined, m);

  if (["play", "yta", "ytmp3"].includes(command)) {
    try {
      const api = await ddownr.download(video.url, "mp3");
      await conn.sendMessage(m.chat, {
        audio: { url: api.downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`,
        ptt: false
      }, { quoted: m });

      await m.react("✅");
    } catch (e) {
      return m.reply("⛔ Error al descargar audio.");
    }
  }

  if (["play2", "ytv", "ytmp4"].includes(command)) {
    try {
      const fuentes = [
        `https://api.siputzx.my.id/api/d/ytmp4?url=${video.url}`,
        `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${video.url}`,
        `https://axeel.my.id/api/download/video?url=${encodeURIComponent(video.url)}`,
        `https://delirius-apiofc.vercel.app/download/ytmp4?url=${video.url}`
      ];

      for (const fuente of fuentes) {
        try {
          const r = await fetch(fuente);
          const j = await r.json();
          const link = j?.data?.dl || j?.result?.download?.url || j?.downloads?.url || j?.data?.download?.url;
          if (!link) continue;

          const head = await fetch(link, { method: "HEAD" });
          const size = parseInt(head.headers.get("Content-Length")) || 0;
          const asDoc = (size / 1024 / 1024) >= limit;

          await conn.sendFile(m.chat, link, `${video.title}.mp4`, undefined, m, null, {
            asDocument: asDoc,
            mimetype: "video/mp4"
          });

          await m.react("✅");
          return;
        } catch { }
      }

      return m.reply("⛔ No se pudo descargar desde ninguna fuente.");
    } catch (e) {
      return m.reply("⛔ Error al descargar video.");
    }
  }
};

handler.help = ["play"];
handler.tags = ["download"];
handler.command = ["play"];

export default handler;

function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${min}:${s}`;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  for (const word of words) {
    const testLine = line + word + ' ';
    const { width } = ctx.measureText(testLine);
    if (width > maxWidth && line) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = testLine;
    }
  }

  if (line) lines.push(line.trim());
  return lines;
}

async function create(imageUrl, { title, author, duration, views, current, total }) {
  const canvas = createCanvas(1280, 720);
  const ctx = canvas.getContext('2d');

  const res = await fetch(imageUrl);
  const buffer = await res.buffer();
  const img = await loadImage(buffer);

  const { value: [r, g, b] } = await getAverageColor(buffer);
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, 0, 0, 1280, 720);

  // Fondo de datos
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 500, 1280, 220);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 38px sans-serif';
  ctx.textAlign = 'left';
  const lines = wrapText(ctx, title, 1180);
  lines.forEach((line, i) => ctx.fillText(line, 50, 550 + i * 42));

  ctx.font = '28px sans-serif';
  ctx.fillText(`Canal: ${author}`, 50, 610 + lines.length * 10);
  ctx.fillText(`Duración: ${duration}`, 50, 650 + lines.length * 10);
  ctx.fillText(`Vistas: ${views}`, 50, 690 + lines.length * 10);

  const barX = 50;
  const barY = 705;
  const barW = 1180;
  const barH = 8;
  const progress = Math.min(current / total, 1);

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(barX, barY, barW, barH);

  ctx.fillStyle = '#fff';
  ctx.fillRect(barX, barY, barW * progress, barH);

  ctx.font = '20px sans-serif';
  ctx.fillText(formatTime(current), barX, barY + 25);
  ctx.textAlign = 'right';
  ctx.fillText(formatTime(total), barX + barW, barY + 25);

  return canvas.toBuffer();
}