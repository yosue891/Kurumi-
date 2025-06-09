import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { react: { text: '👋', key: m.key } });

  let creators = [
    {
      number: '50493732693',
      name: 'Wirk',
      org: 'Creador',
      label: 'Creador +50493732693',
      region: 'Honduras',
      email: 'minexdt@gmail.com',
      website: 'https://wirksi-box.vercel.app/',
      description: 'No hacer spam',
    },
    {
      number: '51921826291',
      name: 'Maycol',
      org: 'Creador',
      label: 'Creador +51 921 826 291',
      region: 'Perú',
      email: 'karatekidamerica@gmail.com',
      website: 'Pronto',
      description: 'Insano XD',
    },
  ];

  let contacts = creators.map(({ number, name, org, label, region, email, website, description }) => {
    let cleanNumber = number.replace(/[^0-9]/g, '');
    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
ORG:${org}
TEL;type=CELL;waid=${cleanNumber}:${PhoneNumber('+' + cleanNumber).getNumber('international')}
X-ABLabel:${label}
EMAIL;type=INTERNET:${email}
X-ABLabel:Email
ADR:;;${region};;;;
X-ABLabel:Region
URL:${website}
X-ABLabel:Website
NOTE:${description}
END:VCARD`.trim();

    return { vcard, displayName: name };
  });

  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: 'Creadores',
      contacts
    }
  }, { quoted: m });
};

handler.help = ['creadores'];
handler.tags = ['info'];
handler.command = ['creador', 'owner', 'dueño', 'creadores'];

export default handler;