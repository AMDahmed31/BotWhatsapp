module.exports = {
    commands: ['صوره', 'صورة'],

    async execute(sock, msg, from, text) {
        try {
            let target;

            // التحقق من وجود رد (Reply)
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
            
            // تنظيف النص لاستخراج الرقم
            const args = text.split(' ');
            const number = args.length > 1 ? args[1].replace(/[^0-9]/g, '') : null;

            if (quoted) {
                target = quoted;
            } else if (number) {
                target = number + '@s.whatsapp.net';
            } else {
                return await sock.sendMessage(from, { text: "❓ طريقة الاستخدام:\n1- رد على شخص واكتب *صوره*\n2- اكتب *صوره* وبعدها الرقم (مثال: صوره 2010xxxxxxxx)" });
            }

            console.log("جاري محاولة جلب صورة لـ: ", target);

            // جلب الصورة (استخدام الدقة العالية 'image')
            const ppUrl = await sock.profilePictureUrl(target, 'image').catch((e) => {
                console.log("خطأ في الخصوصية أو الرقم: ", e.message);
                return null;
            });

            if (ppUrl) {
                await sock.sendMessage(from, { 
                    image: { url: ppUrl }, 
                    caption: `📸 تم جلب الصورة بنجاح.` 
                }, { quoted: msg });
                await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
            } else {
                await sock.sendMessage(from, { text: "❌ لا يمكن جلب الصورة. الأسباب المحتملة:\n1- صاحب الرقم خافي الصورة.\n2- الرقم غير مسجل في واتساب." });
                await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            }

        } catch (err) {
            console.error("خطأ عام في الأمر:", err);
        }
    }
};

