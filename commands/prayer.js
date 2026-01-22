const { PrayerTimes, Coordinates, CalculationMethod } = require('adhan');
const cron = require('node-cron');


function schedulePrayer(sock) {
    // إيديهات الجروبات الخاصة بك
    const groupIds = [
        '120363422280225750@g.us',
        '120363421327093924@g.us',
        '120363403331413499@g.us'
    ];

    // إعدادات الموقع (القاهرة، مصر)
    const coords = new Coordinates(30.0444, 31.2357); 
    const params = CalculationMethod.Egyptian();

    // فحص الوقت كل دقيقة
    cron.schedule('* * * * *', async () => {
        const date = new Date();
        const prayerTimes = new PrayerTimes(coords, date, params);
        
        // صيغة الوقت الحالية (ساعة:دقيقة) بتوقيت 24 ساعة للمقارنة
        const now = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const prayers = {
            fajr: { name: 'الـفجر', time: prayerTimes.fajr.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) },
            dhuhr: { name: 'الـظهر', time: prayerTimes.dhuhr.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) },
            asr: { name: 'الـعصر', time: prayerTimes.asr.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) },
            maghrib: { name: 'الـمغرب', time: prayerTimes.maghrib.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) },
            isha: { name: 'الـعشاء', time: prayerTimes.isha.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) },
        };

        for (let p in prayers) {
            if (now === prayers[p].time) {
                for (let id of groupIds) {
                    try {
                        // جلب الأعضاء لعمل منشن للكل
                        const metadata = await sock.groupMetadata(id);
                        const participants = metadata.participants.map(u => u.id);
                        
                        // نص الرسالة المطلوب
                        const prayerMsg = `صـلاتك هي أول طـريق لنجاحك ، نـاس كتير نجحت بسبب الصلاة\n\n*صـلاة ${prayers[p].name} أثابكم الله* ❤️‍🩹`;

                        await sock.sendMessage(id, { 
                            text: prayerMsg,
                            mentions: participants
                        });
                        
                        console.log(`✅ تم إرسال منشن صلاة ${prayers[p].name} للجروب: ${id}`);
                    } catch (e) { 
                        console.log("❌ خطأ في إرسال منشن الصلاة:", e.message); 
                    }
                }
            }
        }
    });
}

module.exports = {
    commands: ['تفعيل_الصلاة'], 
    execute: async (sock, msg, from) => {
        // إذا أردت تشغيله يدوياً للتجربة
        await sock.sendMessage(from, { text: "✅ نظام الصلاة يعمل بالخلفية الآن." });
    },
    schedulePrayer 
};

