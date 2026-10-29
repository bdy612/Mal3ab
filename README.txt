ملعب (Mal3ab) — ألعاب multiplayer
==================================

التشغيل:
  افتح index.html في المتصفح (دبل كليك).
  للعب أونلاين لازم إنترنت (الغرف على Supabase، مشروع "Mal3ab Games").

اللعب:
  - "نفس الجهاز": اتنين على نفس الشاشة بالتبادل.
  - "أونلاين": بيعمل غرفة وبيديك كود من ٤ حروف. ابعته لصاحبك،
    هو يفتح index.html ويكتب الكود ويضغط "ادخل الغرفة".
    (لو هو على جهاز تاني، لازم يبقى عنده نسخة من الفولدر ده، أو ترفعه على موقع).

الملفات:
  index.html            الصفحة الرئيسية (اختيار لعبة + دخول بكود)
  catalog.html          اكتشف 5000 لعبة (بحث + اختيار عشوائي)
  games/tictactoe.html  إكس أو
  games/connect4.html   كونكت ٤
  games/chess.html      شطرنج (قواعد كاملة بمكتبة chess.js)
  shared/net.js         الاتصال بـ Supabase (إنشاء/دخول الغرف + التحديث اللحظي)
  shared/shell.js       الإطار المشترك: local/online، الأدوار، شريط الحالة
  shared/style.css      الشكل
  shared/top5000_games.json  بيانات الكتالوج

إضافة لعبة جديدة:
  1. انسخ games/tictactoe.html وغيّر المنطق.
  2. ضيف سطر في مصفوفة GAMES في index.html.
  كل لعبة بتخزن حالتها في S.state (لازم يبقى فيها turn و winner)،
  وبتنادي S.commit() بعد كل حركة.

قاعدة البيانات (Supabase):
  جدول rooms: code, game, state (jsonb), players, created_at, updated_at
