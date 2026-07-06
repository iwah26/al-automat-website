import Link from "next/link";

export function SednahRabanimIntro({ referralCode }: { referralCode?: string }) {
  const formHref = referralCode
    ? `/sednah-rabanim/form?c=${encodeURIComponent(referralCode)}`
    : "/sednah-rabanim/form";

  return (
    <div className="max-w-2xl mx-auto text-right mb-16">
      <div className="text-center mb-10">
        <p className="text-2xl text-white font-bold mb-2">שלום לך הרב!</p>
        <h1 className="text-4xl font-black text-white leading-snug">
          Claude Code לרבנים
        </h1>
        <p className="text-xl text-brand-accent font-bold mt-2">
          לנהל את הקהילה. לנהל את עצמך.
        </p>
      </div>

      <div className="space-y-5 text-slate-300 text-lg leading-relaxed">
        <p>
          כל שבוע נופלות עליך משימות שאינן רבנות — ימי הולדת, יארצייטים,
          מעקב אחר מי נעדר, כתיבת הודעות. בלי מזכירה, בלי תקציב לצוות.
        </p>
        <p>
          היום יש כלי שיכול לעשות את זה בשבילך — Claude Code, מערכת AI
          לבניית כלים אישיים, בלי צורך בידע טכני.
        </p>
        <p className="font-semibold text-white">
          בסדנה בת שני מפגשים תבנה בעצמך:
        </p>
        <ul className="space-y-2">
          <li>🛠️ כלי אישי לניהול הקהילה</li>
          <li>🤖 מערכת אוטומטית שמזכירה לך מי צריך תשומת לב</li>
          <li>📚 שליטה מלאה בכלי — לא תיאוריה, עבודה בפועל</li>
        </ul>
        <p>
          📼 כל המפגשים מוקלטים. מיד אחרי הסדנה תקבל גישה לאתר ייעודי עם
          ההקלטות המלאות, תמלול מלא, ופרומפטים שימושיים — כדי שתוכל להטמיע
          אותם מיד במערכות הקהילה שלך.
        </p>

        <div className="p-5 rounded-2xl bg-brand-card border border-brand-accent/20">
          <p className="font-semibold text-white mb-3">
            📅 12.7 (כ״ז תמוז) + 19.7 (ה׳ אב)
          </p>
          <p className="font-semibold text-white mb-2">🕕 השעות לפי אזור:</p>
          <ul className="space-y-1">
            <li>🇮🇱 18:00–21:00</li>
            <li>🇬🇧 16:00–19:00</li>
            <li>🇪🇸🇫🇷 17:00–20:00</li>
            <li>🇦🇷 12:00–15:00</li>
            <li>🇺🇸🇻🇪 11:00–14:00</li>
            <li>🇲🇽 09:00–12:00</li>
          </ul>
        </div>

        <p className="font-bold text-white text-xl">
          🔥 גישה מוגבלת ל-30 מקומות בלבד
        </p>
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-brand-card border border-brand-accent/20">
        <div className="flex items-center gap-4 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/yitzchak-wahnon.jpg"
            alt="יצחק ווחנון"
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-accent flex-shrink-0"
          />
          <h2 className="text-xl font-bold text-white">מי אני?</h2>
        </div>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            שמי יצחק ווחנון, לשעבר הייתי רב במאלגה. כיום זוכה לנהל את קודשא
            ולהעמיד דור של רבנים שלומדים את החלק המעשי!
          </p>
          <p>
            בהיותי רב במאלגה הכרתי מקרוב את האתגר של רב קהילה בחו"ל — בלי
            מזכירה, בלי מערכות, בלי משאבים. הרבה זמן בזבזתי על פעולות שאינן
            בהכרח רבניות אלא פעולות טכניות ורפטיטיביות.
          </p>
          <p className="font-semibold text-white">היום אפשר אחרת!</p>
          <p>
            במהלך השנים צברתי ידע מקיף בכלי טכנולוגיה מתקדמת, ובשנים
            האחרונות למדתי לעומק את נושא האוטומציה ובניית מערכות CRM.
          </p>
          <p>
            אבל מה שקורה עכשיו עם AI עולה על הכל. ולא סתם AI — מערכות AI
            לכתיבת קוד, כמו Claude Code. זה באמת <strong>Game Changer</strong>.
          </p>
          <p>אז פתחתי סדנה אינטנסיבית שמחברת בין שני העולמות שלי — רבנות ו-AI.</p>
          <p>
            אני רוצה להזמין אותך אישית ללמוד איך להשתמש בכלי הזה, שיקל על
            העבודה היום-יומית שלך בקהילה, ויתן לך כוח לפעול מול הקהילה שלך
            ביתר דיוק, מקצועיות, וכמובן — מסירות.
          </p>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-3xl font-black text-white mb-8">
          כל זה רק ב-950₪
        </p>
        <Link
          href={formHref}
          className="inline-block px-10 py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity"
        >
          להרשמה ←
        </Link>
      </div>
    </div>
  );
}
