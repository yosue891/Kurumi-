let handler = async (m, { conn, participants, groupMetadata, args }) => {
const pp = 'https://raw.githubusercontent.com/Ado926/WirksiBoxFiles/main/1749507001894-pxq76l-1749506980024-39d93e.jpg';
const groupAdmins = participants.filter(p => p.admin)
const listAdmin = groupAdmins.map((v, i) => ` - @${v.id.split('@')[0]}`).join('\n')
const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'

let text = `
≡ 👾 \`Admins del grupo :\` *${groupMetadata.subject}*

${listAdmin}

`.trim()
conn.sendFile(m.chat, pp, 'staff.png', text, m, false, { mentions: [...groupAdmins.map(v => v.id), owner] })
}
handler.help = ['staff']
handler.tags = ['group']
handler.command = ['staff', 'admins', 'listadmin'] 
handler.group = true
export default handler