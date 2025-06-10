import fetch from 'node-fetch'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { writeFileSync, unlinkSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import FastAverageColor from 'fast-average-color-node'
import { createCanvas } from 'canvas'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const handler = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.imageMessage) {
    return m.reply('📷 *Responde a una imagen para detectar su color promedio.*')
  }

  try {
    const imgMsg = m.quoted
    const stream = await downloadContentFromMessage(imgMsg.message.imageMessage, 'image')
    const buffer = []

    for await (const chunk of stream) buffer.push(chunk)
    const imgBuffer = Buffer.concat(buffer)

    // Guardar temporalmente
    const tmpPath = path.join(tmpdir(), `${Date.now()}.jpg`)
    writeFileSync(tmpPath, imgBuffer)

    // Obtener color promedio
    const fac = new FastAverageColor()
    const color = await fac.getAverageColor(tmpPath)

    // Crear imagen con el color
    const canvas = createCanvas(300, 150)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color.hex
    ctx.fillRect(0, 0, 300, 150)

    const outBuffer = canvas.toBuffer()

    await conn.sendMessage(m.chat, {
      image: outBuffer,
      caption: `🎨 Color promedio: *${color.hex}*`,
    }, { quoted: m })

    // Eliminar archivo temporal
    unlinkSync(tmpPath)
  } catch (err) {
    console.error(err)
    m.reply('❌ Ocurrió un error al procesar la imagen.')
  }
}

handler.help = ['dominante']
handler.tags = ['tools']
handler.command = /^dominante$/i

export default handler