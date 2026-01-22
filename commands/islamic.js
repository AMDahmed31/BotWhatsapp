const fs = require('fs')

module.exports = {
    commands: ['.اذكار الصباح', '.اذكار المساء', '.اذكار النوم', '</ص'],
    async execute(sock, msg, from, text) {
        // أمر المنشن بالصلاة
        if (text === '</ص') {
            const groupMetadata = from.endsWith('@g.us') ? await sock.groupMetadata(from) : null
            const mentions = groupMetadata ? groupMetadata.participants.map(p => p.id) : []
            return await sock.sendMessage(from, {
                text: '━━━━━━━━━━━━━━━\n🕌 *تذكير بالصلاة على النبي* 🕌\n━━━━━━━━━━━━━━━\n\n صلِّ على محمد\nاللهم صلي وسلم علي محمد وعلي ال محمد🤍 \n━━━━━━━━━━━━━━━',
                mentions: mentions
            }, { quoted: msg })
        }

        // الأذكار
        let file = ''
        if (text === '.اذكار الصباح') file = 'Azkar_AL_SBAH.txt'
        if (text === '.اذكار المساء') file = 'Azkar_AL_MASA.txt'
        if (text === '.اذكار النوم') file = 'Azkar_Sleep.txt'

        if (file) {
            if (fs.existsSync(`./${file}`)) {
                const content = fs.readFileSync(`./${file}`, 'utf8')
                await sock.sendMessage(from, { text: content }, { quoted: msg })
            } else {
                await sock.sendMessage(from, { text: `❌ الملف ${file} غير موجود` })
            }
        }
    },

    scheduleAzkar(sock, GROUP_ID) {
        setInterval(async () => {
            const hour = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })).getHours()
            if (hour === 7) await sock.sendMessage(GROUP_ID, { text: "🌅 أذكار الصباح.." })
            if (hour === 18) await sock.sendMessage(GROUP_ID, { text: "🌆 أذكار المساء.." })
        }, 60000)
    }
}

