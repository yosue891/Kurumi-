import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";

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
    } else throw new Error("⛔ No se pudo obtener detalles.");
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
      await new Promise(resolve => setTimeout(resolve, 1000)); // espera mínima
    }
  }
};

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply("✧ Ingresa el nombre de un video o URL de YouTube.");
  await m.react("🕛");

  const res = await yts(text);
  if (!res.all.length) return m.reply("⛔ No se encontraron resultados.");

  const video = res.all[0];
  const cap = `「❀」${video.title}

> ✧ Canal : » ${video.author.name}
> ✧ Duración : » ${video.duration.timestamp}
> ✧ Vistas : » ${video.views.toLocaleString()}
> ✧ URL : » ${video.url}`;

  await conn.sendFile(m.chat, video.thumbnail, "thumb.jpg", cap, m);

  if (["play", "yta", "ytmp3"].includes(command)) {
    try {
      const api = await ddownr.download(video.url, "mp3");

      await conn.sendMessage(m.chat, {
        audio: { url: api.downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`,
        ptt: true
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

          await conn.sendFile(m.chat, link, `${video.title}.mp4`, cap, m, null, {
            asDocument: asDoc,
            mimetype: "video/mp4"
          });

          await m.react("✅");
          return;
        } catch {}
      }

      return m.reply("⛔ No se pudo descargar desde ninguna fuente.");
    } catch (e) {
      return m.reply("⛔ Error al descargar video.");
    }
  }
};

handler.help = ["play"];
handler.tags = ["descargas"];
handler.command = ["play"];

export default handler;