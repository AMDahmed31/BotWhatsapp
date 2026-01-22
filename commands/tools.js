const fs = require('fs')
const timeIntervals = new Map()

function getCairoTime() {
    return new Date().toLocaleString('en-EG', {
        timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    })
}

module.exports = {
    commands: ['</الوقت', '</إيقاف الوقت', '.ملف'],
    async execute(sock, msg, from, text) {
        
        if (text.startsWith('.ملف ')) {
            const fileName = text.replace('.ملف ', '').trim() + '.txt'
            if (fs.existsSync(`./${fileName}`)) {
                const content = fs.readFileSync(`./${fileName}`, 'utf8')
                await sock.sendMessage(from, { text: content }, { quoted: msg })
            } else {
                await sock.sendMessage(from, { text: `❌ الملف ${fileName} غير موجود` })
            }
        }

        if (text === '</الوقت') {
            if (timeIntervals.has(from)) clearInterval(timeIntervals.get(from))
            const firstMsg = await sock.sendMessage(from, { text: `⏰ الوقت: ${getCairoTime()} ⚪️` }, { quoted: msg })
            
            const interval = setInterval(async () => {
                try {
                    await sock.sendMessage(from, { 
                        text: `⏰ الوقت: ${getCairoTime()} 🔴`, 
                        edit: firstMsg.key 
                    })
                } catch { 
                    clearInterval(interval)
                    timeIntervals.delete(from)
                }
            }, 4000)
            timeIntervals.set(from, interval)
        }

        if (text === '</إيقاف الوقت') {
            if (timeIntervals.has(from)) {
                clearInterval(timeIntervals.get(from))
                timeIntervals.delete(from)
                await sock.sendMessage(from, { text: '✅ تم الإيقاف' })
            }
        }
    }
}

