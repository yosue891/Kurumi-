import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fsPromises } from "fs";
const fs = { ...fsPromises, existsSync };
import path, { join } from 'path';
import ws from 'ws';

let handler = async (m, { conn: _envio, command, usedPrefix, args, text, isOwner }) => {
    const isCommand1 = /^(deletesesion|deletebot|deletesession|deletesesaion)$/i.test(command)  
    const isCommand2 = /^(stop|pausarai|pausarbot)$/i.test(command)  
    const isCommand3 = /^(bots|sockets|socket)$/i.test(command)   

    async function reportError(e) {
        await m.reply(`🚫 Ocurrió un error.`)
        console.log(e)
    }

    switch (true) {
        case isCommand1:
            let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
            let uniqid = `${who.split`@`[0]}`
            const path = `./${jadi}/${uniqid}`

            if (!await fs.existsSync(path)) {
                await conn.sendMessage(m.chat, { text: `⚠️ Usted no tiene una sesión, puede crear una usando:\n${usedPrefix + command}\n\nSi tiene una *(ID)* puede usar para saltarse el paso anterior usando:\n*${usedPrefix + command}* \`\`\`(ID)\`\`\`` }, { quoted: m })
                return
            }
            if (global.conn.user.jid !== conn.user.jid) return conn.sendMessage(m.chat, {text: `⚠️ Use este comando al *Bot* principal.\n\n*https://api.whatsapp.com/send/?phone=${global.conn.user.jid.split`@`[0]}&text=${usedPrefix + command}&type=phone_number&app_absent=0*`}, { quoted: m }) 
            else {
                await conn.sendMessage(m.chat, { text: `✅ Tu sesión como *Sub-Bot* se ha eliminado` }, { quoted: m })
            }
            try {
                fs.rmdir(`./${jadi}/` + uniqid, { recursive: true, force: true })
                await conn.sendMessage(m.chat, { text : `🗑️ Ha cerrado sesión y borrado todo rastro.` } , { quoted: m })
            } catch (e) {
                reportError(e)
            }
            break

        case isCommand2:
            if (global.conn.user.jid == conn.user.jid) conn.reply(m.chat, `⚠️ Si no es *Sub-Bot* comuníquese al número principal del *Bot* para ser *Sub-Bot*.`, m)
            else {
                await conn.reply(m.chat, `💤 ${botname} desactivada.`, m)
                conn.ws.close()  
            }
            break

        case isCommand3:
            const SUBBOTS_DIR = './Data/Sesiones/Subbots';
            let subBots = [];
            if (existsSync(SUBBOTS_DIR)) {
                try {
                    subBots = readdirSync(SUBBOTS_DIR).filter(name => {
                        const dir = join(SUBBOTS_DIR, name);
                        return statSync(dir).isDirectory();
                    });
                } catch (e) {
                    console.error('Error leyendo subbots:', e);
                }
            }

            const isMainBot = global.conn.user.jid === conn.user.jid;
            const subBotsList = subBots.map((s, i) => `╰➤ ${i + 1}. wa.me/${s}`).join('\n') || '_Ninguno conectado_';

            const responseMessage = isMainBot
                ? `*「✦」SubBots activos (${subBots.length})*\n\n${subBotsList}\n\n✧ Para ser SubBot usa *#code*`
                : `🤖 *ESTE ES UN SUB-BOT*\n\n*SubBots detectados:* ${subBots.length}`;

            await _envio.sendMessage(m.chat, {
                text: responseMessage,
                mentions: _envio.parseMention(responseMessage)
            }, { quoted: m });
            break
    }
}

handler.tags = ['serbot'];
handler.help = ['sockets', 'deletesesion', 'pausarai'];
handler.command = ['deletesesion', 'deletebot', 'deletesession', 'deletesesaion', 'stop', 'pausarai', 'pausarbot', 'bots', 'sockets', 'socket'];

export default handler;