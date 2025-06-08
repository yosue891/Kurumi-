// Lista de canales disponibles
global.canalIdM = [
  "120363402846939411@newsletter",
  "120363420047428304@newsletter"
]
global.canalNombreM = [
  "✦ sʏᴀ ᴛᴇᴀᴍ | 2025 ✧",
  "✧❅ꨄ ʏᴜʀᴜ ʏᴜʀɪ ┋ᴄʜᴀɴɴᴇʟ ☙❢❀"
]

// Función para obtener un canal aleatorio
global.getRandomChannel = () => {
  const index = Math.floor(Math.random() * global.canalIdM.length)
  return {
    id: global.canalIdM[index],
    name: global.canalNombreM[index]
  }
}

// Canal aleatorio
global.channelRD = getRandomChannel()

// Mensaje reenviado desde canal
global.rcanal = {
  contextInfo: {
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: global.channelRD.id,
      newsletterName: global.channelRD.name,
      serverMessageId: -1
    }
  }
}