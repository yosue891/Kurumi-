const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let active = []
    let inactive = []

    // Recorremos los subbots registrados en global.subbots
    for (const id in global.subbots) {
      const subbot = global.subbots[id]
      if (subbot?.conn?.ws?.readyState === 1) {
        active.push(`✅ @${id.replace(/[^0-9]/g, '')}`)
      } else {
        inactive.push(`❌ @${id.replace(/[^0-9]/g, '')}`)
      }
    }

    let text = `🌸 *Sub Bots Registrados en ${global.botname || 'el Bot'}*\n\n`

    text += `👑 *Activos (${active.length}):*\n${active.length ? active.join('\n') : '_Ninguno activo ahora_'}\n\n`
    text += `🔕 *Inactivos (${inactive.length}):*\n${inactive.length ? inactive.join('\n') : '_Todos activos_'}\n`

    await m.reply(text)
  } catch (e) {
    console.error(e)
    await m.reply('⚠️ Ocurrió un error al listar los sub bots.')
  }
}

handler.command = /^bots$/i
handler.help = ['bots']
handler.tags = ['info']
handler.register = false

export default handler