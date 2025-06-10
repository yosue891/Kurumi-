import yts from 'yt-search';
import fs from 'fs';
import axios from 'axios';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

// Function to check if a user is blocked
const isUserBlocked = (userId) => {
  try {
    const blockedUsers = JSON.parse(fs.readFileSync('./bloqueados.json', 'utf8'));
    return blockedUsers.includes(userId);
  } catch (error) {
    // Log the error but don't prevent functionality if file is missing/corrupt
    console.error('Error reading blocked users file:', error.message);
    return false;
  }
};

// Function to get the download URL from various APIs
const getDownloadUrl = async (videoUrl) => {
  const apis = [
    { url: 'https://api.vreden.my.id/api/ytmp3?url=', type: 'vreden' },
    // You can add more APIs here for redundancy if available and reliable
    // { url: 'https://another-api.com/ytmp3?url=', type: 'another_api' },
  ];

  for (const api of apis) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(`${api.url}${encodeURIComponent(videoUrl)}`, { timeout: TIMEOUT_MS });
        if (
          response.data?.status === 200 &&
          response.data?.result?.download?.url &&
          response.data?.result?.download?.status === true
        ) {
          return {
            url: response.data.result.download.url.trim(),
            title: response.data.result.metadata.title
          };
        } else {
          // Log unexpected API response structure for debugging
          console.warn(`API ${api.type} returned unexpected data on attempt ${attempt + 1}:`, response.data);
        }
      } catch (error) {
        console.error(`Error with API ${api.type} on attempt ${attempt + 1}:`, error.message);
        if (attempt < MAX_RETRIES - 1) {
          await wait(RETRY_DELAY_MS);
        }
      }
    }
  }
  return null; // Return null if all APIs fail after retries
};

// Function to send the audio message
const sendAudioNormal = async (conn, chat, audioUrl) => { // Removed videoTitle and thumbnailBuffer as they are not needed for contextInfo
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await conn.sendMessage(
        chat,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
        },
        { quoted: null }
      );
      return true; // Audio sent successfully
    } catch (error) {
      console.error(`Error sending audio message on attempt ${attempt + 1}:`, error.message);
      if (attempt < MAX_RETRIES - 1) {
        await wait(RETRY_DELAY_MS);
      }
    }
  }
  return false; // Failed to send audio after all retries
};

// Main handler for the 'play' command
const handler = async (m, { conn, text, usedPrefix, command }) => {
  const userId = m.sender;

  // Check if user is blocked
  if (isUserBlocked(userId)) {
    await conn.reply(m.chat, '🚫 Lo siento, estás en la lista de usuarios bloqueados.', m);
    return;
  }

  // Handle no text input (show usage instructions)
  if (!text || !text.trim()) {
    let helpThumbnailBuffer = null;
    try {
      const response = await axios.get('https://files.catbox.moe/rdxsm0.jpg', { responseType: 'arraybuffer' });
      helpThumbnailBuffer = Buffer.from(response.data, 'binary');
    } catch (error) {
      console.error('Error fetching help thumbnail:', error.message);
    }

    await conn.sendMessage(
      m.chat,
      {
        text: `Uso: ${usedPrefix + command} <nombre de la canción>\n> Ejemplo: ${usedPrefix + command} Mi Vida Eres Tu `,
        contextInfo: {
          externalAdReply: {
            title: 'Bot Music', // Changed from MediaHub Music
            previewType: 'PHOTO',
            thumbnail: helpThumbnailBuffer || null,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: true,
            sourceUrl: 'https://example.com' // Changed from MediaHub URL
          }
        }
      },
      { quoted: m }
    );
    return;
  }

  // Determine greeting based on current time in Lima
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/Lima' });
  const currentHour = new Date(currentTime).getHours();
  const greeting = currentHour < 12 ? 'Buenos días 🌅' : currentHour < 18 ? 'Buenas tardes 🌄' : 'Buenas noches 🌃';

  const userNumber = m.sender.split('@')[0];
  const reactionMessage = await conn.reply(
    m.chat,
    `${greeting} @${userNumber},\nEstoy buscando la música solicitada.\n\n> ¡Gracias por usar este servicio!,`, // Removed MediaHub branding
    m,
    { mentions: [m.sender] }
  );

  await conn.sendMessage(m.chat, { react: { text: '📀', key: reactionMessage.key } }, { quoted: m });

  try {
    // Search for the video on YouTube
    const searchResults = await yts(text.trim());
    if (!searchResults?.videos?.length) {
      await conn.sendMessage(m.chat, { react: { text: '🔴', key: reactionMessage.key } }, { quoted: m });
      throw new Error('No se encontraron resultados en YouTube.');
    }

    const videoInfo = searchResults.videos[0];
    const { title, timestamp: duration, views, ago, url: videoUrl } = videoInfo;

    // Download the video thumbnail as a buffer
    let videoThumbnailBuffer = null;
    try {
      const response = await axios.get(videoInfo.image, { responseType: 'arraybuffer' });
      videoThumbnailBuffer = Buffer.from(response.data, 'binary');
    } catch (error) {
      console.error('Error fetching video thumbnail:', error.message);
      // Continue without video thumbnail if fetching fails
    }

    // Prepare and send video information message
    const description = ` ${title}
⏱  *Duración:* ${duration || 'Desconocida'}
👀  *Vistas:* ${views.toLocaleString()}
📅  *Publicado:* ${ago || 'Desconocido'}
🔗  *URL:* ${videoUrl}`;

    await conn.sendMessage(
      m.chat,
      {
        text: description,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: wm, // Changed from MediaHub Music
            previewType: 'PHOTO',
            thumbnail: videoThumbnailBuffer || null,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          }
        }
      },
      { quoted: m }
    );

    // Get download URL from APIs
    const downloadData = await getDownloadUrl(videoUrl);
    if (!downloadData || !downloadData.url) {
      await conn.sendMessage(m.chat, { react: { text: '🔴', key: reactionMessage.key } }, { quoted: m });
      throw new Error('No se pudo descargar la música desde ninguna API.');
    }

    // Send the audio file
    await conn.sendMessage(m.chat, { react: { text: '🟢', key: reactionMessage.key } }, { quoted: m });
    const success = await sendAudioNormal(conn, m.chat, downloadData.url); // Removed downloadData.title
    if (!success) {
      throw new Error('No se pudo enviar el audio después de varios intentos.');
    }

  } catch (error) {
    // Centralized error handling for user feedback
    await conn.reply(m.chat, `🚨 *Error:* ${error.message || 'Error desconocido, por favor intente de nuevo más tarde.'}`, m);
  }
};

handler.command = ['play1']
export default handler;
