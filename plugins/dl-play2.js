import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn: star, args, usedPrefix, command }) => {
  if (!args || !args[0]) {
    return star.reply(
      m.chat,
      `*✎ ¡Ingresa el texto o enlace del vídeo de YouTube!*\n\n» *Ejemplo:*\n> *${usedPrefix + command}* Canción de ejemplo`,
      m
    )
  }

  await m.react('🕓')

  try {
    let query = args.join(' ')
    let isUrl = /youtu/.test(query)
    let video

    if (isUrl) {
      let videoId = query.split('v=')[1]?.split('&')[0] || query.split('/').pop()
      let ytres = await yts({ videoId })
      video = ytres.videos[0]
    } else {
      let ytres = await yts(query)
      video = ytres.videos[0]
      if (!video) {
        await m.react('✖️')
        return star.reply(m.chat, '✦ *Video no encontrado.*', m)
      }
    }

    let { title, thumbnail, timestamp, views, ago, url, author } = video

    let res = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`)
    let json = await res.json()

    if (!json.data || !json.data.dl) {
      await m.react('✖️')
      return star.reply(m.chat, '✦ *Error al obtener el enlace de descarga desde la API.*', m)
    }

    let downloadUrl = json.data.dl
    let txt = `*「✦」 » ${title}*\n\n`
    txt += `> ✦ Canal » ${author.name}\n`
    txt += `> ⴵ Duración » ${timestamp}\n`
    txt += `> ✰ Vistas » ${views}\n`
    txt += `> ✐ Publicación » ${ago}\n`
    txt += `> ❒ Tamaño: » ${json.data.size}\n`
    txt += `> 🜸 Link » ${url}`

    await star.sendFile(m.chat, thumbnail, 'thumbnail.jpg', txt, m)

    await star.sendMessage(
      m.chat,
      {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: title
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('✖️')
    return star.reply(m.chat, '✦ Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.', m)
  }
}

handler.command = ['play2', 'playvidoc']

export default handler