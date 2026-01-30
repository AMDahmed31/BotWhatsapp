[app]

# اسم التطبيق
title = BotWhatsapp

# اسم الحزمة
package.name = botwhatsapp

# النطاق
package.domain = com.amdahmed31

# المجلد المصدر
source.dir = .

# امتدادات الملفات المضمنة
source.include_exts = py,png,jpg,jpeg,kv,atlas,json,txt,js,sh,md

# استثناء الملفات والمجلدات غير الضرورية
source.exclude_dirs = tests, bin, .buildozer, .git, __pycache__, node_modules, .github
source.exclude_patterns = LICENSE, README.md, *.pyc, .gitignore

# الإصدار
version = 1.0.0

# المتطلبات - المكتبات المطلوبة
requirements = python3,kivy==2.3.0,kivymd==1.1.1,pillow,requests,urllib3,certifi,charset-normalizer,idna

# التوجهات المدعومة
orientation = portrait

# الأيقونة (إذا كان موجود)
# icon.filename = %(source.dir)s/icon.png

# شاشة البداية (إذا كان موجود)
# presplash.filename = %(source.dir)s/presplash.png

# الصلاحيات المطلوبة
android.permissions = INTERNET,ACCESS_NETWORK_STATE,WRITE_EXTERNAL_STORAGE,READ_EXTERNAL_STORAGE,ACCESS_WIFI_STATE

# نسخة Android API
android.api = 33

# الحد الأدنى لـ API
android.minapi = 21

# نسخة SDK
android.sdk = 33

# نسخة NDK
android.ndk = 25b

# قبول التراخيص تلقائياً
android.accept_sdk_license = True

# وضع الشاشة الكاملة (0 = لا)
fullscreen = 0

# تفعيل AndroidX
android.enable_androidx = True

# معمارية المعالج
#android.archs = arm64-v8a,armeabi-v7a
android.archs = arm64-v8a

# السماح بالنسخ الاحتياطي
android.allow_backup = True

# Bootstrap
p4a.bootstrap = sdl2

# تخطي التحديث التلقائي
# p4a.skip_update = False

# مجلد الـ source code للـ p4a (اختياري)
# p4a.source_dir = 

# Local recipes (اختياري)
# p4a.local_recipes = 

# Gradle dependencies (اختياري)
android.gradle_dependencies = 

# AAR libraries (اختياري)
# android.add_aars = 

# Java files (اختياري)
# android.add_src = 

# Logcat filters للتطوير
# android.logcat_filters = *:S python:D

# Copy libraries (اختياري)
# android.add_libs_armeabi_v7a = 
# android.add_libs_arm64_v8a = 

# Wakelock للحفاظ على الشاشة (اختياري)
# android.wakelock = False

# Meta-data (اختياري)
# android.meta_data = 

# الخدمات في الخلفية (اختياري)
# services = NAME:ENTRYPOINT_TO_PY,NAME2:ENTRYPOINT2_TO_PY

[buildozer]

# مستوى السجل (0 = أقل، 2 = أكثر)
log_level = 2

# تحذير عند استخدام root
warn_on_root = 1

# مجلد البناء
# build_dir = ./.buildozer

# مجلد الـ bin
# bin_dir = ./bin
