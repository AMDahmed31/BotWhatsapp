[app]
title = WhatsApp Bot A7md
package.name = botwhatsapp
package.domain = org.test
source.dir = .
source.include_exts = py,png,jpg,kv,atlas,js,json
version = 0.1

# المكتبات المطلوبة للواجهة والإنترنت
requirements = python3, kivy==2.3.0, requests

orientation = portrait
fullscreen = 0

# إعدادات الأندرويد والصلاحيات
android.permissions = INTERNET, WAKE_LOCK, FOREGROUND_SERVICE, WRITE_EXTERNAL_STORAGE, READ_EXTERNAL_STORAGE
android.api = 31
android.minapi = 21
android.ndk = 25b
android.ndk_api = 21
android.archs = arm64-v8a
android.wakelock = True

# تفعيل التقارير المفصلة
log_level = 2

[buildozer]
log_level = 2
warn_on_root = 1
