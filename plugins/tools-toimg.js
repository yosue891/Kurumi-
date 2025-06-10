import sharp from 'sharp'

let handler = async (m, { conn }) => {
  const q = m.quoted || m
  const mime = q.mediaType || ''

  if (!/sticker/.test(mime)) {
    return m.reply('🍟 *Debes responder a un sticker fijo para convertirlo a imagen (no animado).*')
  }

  let media
  try {
    media = await q.download()
  } catch {
    return m.reply('❌ *No se pudo descargar el sticker.*')
  }

  let bufferImg
  try {
    bufferImg = await sharp(media).png().toBuffer()
  } catch (e) {
    return m.reply('⚠️ *No se pudo convertir. Asegúrate de que sea un sticker fijo (no animado).*')
  }

  await conn.sendFile(m.chat, bufferImg, 'sticker.png', null, m)
}

handler.help = ['toimg (reply)']
handler.tags = ['tools']
handler.command = ['toimg', 'img', 'jpg']

export default handler