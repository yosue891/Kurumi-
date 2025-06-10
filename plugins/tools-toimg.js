import { webp2png } from '../lib/webp2mp4.js'
import { fromBuffer } from 'file-type'

let handler = async (m, { conn }) => {
  const notStickerMessage = `> 🍟 Debes citar un *sticker fijo* para convertir a imagen.`
  const q = m.quoted || m
  const mime = q.mediaType || ''
  
  if (!/sticker/.test(mime)) return m.reply(notStickerMessage)
  
  const media = await q.download()
  const fileType = await fromBuffer(media)
  
  if (!fileType || fileType.ext !== 'webp') return m.reply(`❌ Solo se puede convertir stickers fijos (no animados).`)
  
  let out = await webp2png(media).catch(_ => null)
  
  if (!out) return m.reply(`❌ Error al convertir el sticker.`)
  
  await conn.sendFile(m.chat, out, 'imagen.png', null, m)
}

handler.help = ['toimg (reply)']
handler.tags = ['tools']
handler.command = ['toimg', 'img', 'jpg']

export default handler