import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fsPromises } from "fs";
const fs = { ...fsPromises, existsSync };
import path, { join } from 'path';
import ws from 'ws';

let handler = async (m, { conn: _envio, command, usedPrefix, args, text, isOwner }) => {
    const isCommand1 = /^(deletesesion|deletebot|deletesession|deletesesaion)$/i.test(command);
    const isCommand2 = /^(stop|pausarai|pausarbot)$/i.test(command);
    const isCommand3 = /^(bots|sockets|socket)$/i.test(command);

    async function reportError(e) {
        await m.reply(`❌ Ocurrió un error.`);
        console.error(e);
    }

    switch (true) {
        case isCommand1: {
            let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
            let uniqid = `${who.split`@`[0]}`;
            const path = `./${jadi}/${uniqid}`;

            if (!await fs.existsSync(path)) {
                await _envio.sendMessage(m.chat, {
                    text: `⚠️ Usted no tiene una sesión activa. Cree una usando:\n${usedPrefix}jadibot\n\nO conecte una usando un ID:\n${usedPrefix}code (ID)`
                }, { quoted: m });
                return;
            }

            if (global.conn.user.jid !== conn.user.jid) {
                return _envio.sendMessage(m.chat, {
                    text: `📌 Use este comando solo desde el *bot principal*:\n\nhttps://wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix + command}`
                }, { quoted: m });
            } else {
                await _envio.sendMessage(m.chat, {
                    text: `✅ Tu sesión como *Sub-Bot* se ha eliminado.`
                }, { quoted: m });

                try {
                    await fs.rm(path, { recursive: true, force: true });
                    await _envio.sendMessage(m.chat, {
                        text: `🗑️ Se ha borrado todo rastro de tu sesión.`
                    }, { quoted: m });
                } catch (e) {
                    reportError(e);
                }
            }
            break;
        }

        case isCommand2: {
            if (global.conn.user.jid === conn.user.jid) {
                await _envio.sendMessage(m.chat, {
                    text: `⛔ Este es el bot principal. Para convertirte en Sub-Bot usa el comando:\n${usedPrefix}jadibot`
                }, { quoted: m });
            } else {
                await _envio.sendMessage(m.chat, {
                    text: `🛑 ${botname} ha sido pausado correctamente.`
                }, { quoted: m });
                conn.ws.close();
            }
            break;
        }

        case isCommand3: {
            const users = [
                ...new Set(
                    global.conns.filter((conn) =>
                        conn.user && conn.ws && conn.ws.readyState === ws.OPEN
                    )
                )
            ];

            let list = users.map((conn, i) => `📲 *${i + 1}.* wa.me/${conn.user.jid.split`@`[0]}`).join('\n');

            let replyText = users.length === 0
                ? `❌ No hay Sub-Bots conectados.`
                : `✅ *Sub-Bots conectados: ${users.length}*\n\n${list}`;

            const isMainBot = global.conn.user.jid === conn.user.jid;
            const title = isMainBot ? `*「 SubBots Activos 」*` : `*🤖 Este es un Sub-Bot*\n`;

            await _envio.sendMessage(m.chat, {
                text: `${title}${replyText}`,
                mentions: _envio.parseMention(replyText)
            }, { quoted: m });
            break;
        }
    }
};

// Chequear sub-bots reconectados al iniciar (se ejecuta 1 sola vez cuando carga el archivo)
if (!global._subBotCheck) {
    global._subBotCheck = true;
    if (!global.conns) global.conns = [];

    global.conns = global.conns.filter(conn =>
        conn.user && conn.ws && conn.ws.readyState === ws.OPEN
    );

    console.log(`✅ SubBots activos restaurados: ${global.conns.length}`);
}

handler.tags = ['serbot'];
handler.help = ['sockets', 'deletesesion', 'pausarai'];
handler.command = ['deletesesion', 'deletebot', 'deletesession', 'deletesesaion', 'stop', 'pausarai', 'pausarbot', 'bots', 'sockets', 'socket'];

export default handler;