import fetch from 'node-fetch'
import fg from 'senna-fg'

let handler = async (m, { conn: star, usedPrefix, command, text }) => {
  if (!text) {
    return star.reply(
      m.chat,
      `*✎ ¡Ingresa el texto o enlace del vídeo de YouTube!*\n\n» *Ejemplo:*\n> *${usedPrefix + command}* edits`,
      m
    )
  }

  await m.react('🕓')

  try {
    let api = await (await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${text}`)).json()
    let result = api.data[0]

    let { title, duration, url, publishedAt, image } = result

    let txt = `*「✦」 » ${title}*\n\n`
    txt += `> 🕛 Duración » ${duration}\n`
    txt += `> ✐ Publicación » ${publishedAt}\n`
    txt += `> 🜸 Link » ${url}`

    await star.sendFile(m.chat, image, 'thumb.jpg', txt, m)

    let data = await fg.ytmp4(url)
    let download = data.dl_url

    await star.sendMessage(
      m.chat,
      {
        document: { url: download },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `> Video solicitado`
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('✖️')
    star.reply(m.chat, `✦ Ocurrió un error al procesar tu solicitud.`, m)
  }
}

handler.command = ['pvideo', 'play2']

export default handler