import { createCanvas } from 'canvas'
import { FastAverageColor } from 'fast-average-color-node'
import cfonts from 'cfonts'
import axios from 'axios'
import fs from 'fs'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.quoted || !m.quoted.mime?.startsWith('image/')) {
    throw `📸 Responde a una imagen para detectar el color dominante.\n\nEjemplo:\n${usedPrefix + command}`
  }

  // Descargar imagen temporalmente
  let imgBuffer = await conn.download(m.quoted)
  let fac = new FastAverageColor()
  let result = await fac.getAverageColor(imgBuffer)

  // Mostrar en consola el color con CFonts
  cfonts.say(`Dominante`, {
    font: 'block',
    align: 'center',
    colors: [result.hex.replace('#', '')],
    background: 'black',
    letterSpacing: 1,
    space: true,
  })

  // Crear imagen de color con canvas
  const canvas = createCanvas(400, 200)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = result.hex
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText(`Dominante: ${result.hex}`, 20, 100)

  const outputPath = './tmp/dominante.png'
  const out = fs.createWriteStream(outputPath)
  const stream = canvas.createPNGStream()
  stream.pipe(out)

  out.on('finish', async () => {
    await conn.sendFile(m.chat, outputPath, 'dominante.png', `🎨 Color dominante: *${result.hex}*`, m)
    fs.unlinkSync(outputPath)
  })
}

handler.command = ['dominante', 'color']
handler.help = ['dominante']

export default handler