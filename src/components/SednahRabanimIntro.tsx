export function SednahRabanimIntro() {
  return (
    <div className="max-w-2xl mx-auto text-right mb-16">
      <div className="text-center mb-10">
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
        <p className="font-semibold text-white">
          📅 12.7 (כ״ז תמוז) + 19.7 (ה׳ אב) | 18:00–21:00 שעון ישראל
          <br />
          💰 ₪950 | 30 מקומות בלבד + גישה מלאה להקלטות
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

      <p className="text-center text-2xl mt-12">👇 להרשמה</p>
    </div>
  );
}
