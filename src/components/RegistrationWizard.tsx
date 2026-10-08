"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DIAL_CODES } from "@/lib/dialCodes";
import { CITIES_HE, COUNTRIES_HE } from "@/lib/citiesHe";

export interface RegistrationDetails {
  rid: string;
  sig: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

const WEBHOOK_URL =
  "https://hook.integrator.boost.space/otgpr8yi5mzx38k4n76s3d97wzq3wjp0";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_LABELS: Record<string, string> = {
  avreich: "אברך",
  "rav-kehila": "רב קהילה",
  "rav-rashi": "הרב הראשי",
  "rav-yeshiva": "רב בישיבה",
  menahel: "מנהל מוסד",
  "menahel-beit-sefer": "מנהל בית ספר",
  "melamed-beit-sefer": "מלמד בבית ספר",
  other: "",
  sachir: "שכיר",
  atzmai: "עצמאי / בעל עסק",
  "menahel-tzevet": "מנהל / ראש צוות",
};

// מחזור ד׳ (10.2026) פונה לחרדים עובדים — אותו טופס, נוסח אחר.
const WORKER_COHORTS = new Set(["round4"]);

// מחזורים שמשלמים דרך מורנינג — אשראי וביט הם שני דפי תשלום נפרדים
const MORNING_COHORTS = new Set(["round4"]);

const RABBI_ROLES = ["avreich", "rav-kehila", "rav-rashi", "rav-yeshiva", "menahel", "menahel-beit-sefer", "melamed-beit-sefer", "other"];
const WORKER_ROLES = ["sachir", "atzmai", "menahel-tzevet", "avreich", "other"];

interface FormData {
  firstName: string;
  lastName: string;
  phoneDialCode: string;
  phone: string;
  email: string;
  role: string;
  communityName: string;
  country: string;
  city: string;
  usesAI: string;
  aiTools: string[];
  paysForAI: string;
  aiLevel: string;
  usesCodeAI: string;
  paysForClaude: string;
  usesClaudeAPI: string;
  communityChallenge: string;
  communicationChallenge: string;
  expectations: string;
}

const inputBaseClass =
  "px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent transition-colors text-right";
const inputClass = "w-full " + inputBaseClass;

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
            value === opt
              ? "border-brand-accent bg-brand-dark"
              : "border-brand-accent/30 bg-brand-card hover:border-brand-accent/60"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="accent-brand-accent"
          />
          <span className="text-white">{opt}</span>
        </label>
      ))}
    </div>
  );
}

export function RegistrationWizard({
  referralCode,
  cohort = "round1",
  details,
}: {
  referralCode?: string;
  cohort?: string;
  /** מצב "השלמת פרטים אחרי תשלום" — הפרטים הבסיסיים כבר קיימים */
  details?: RegistrationDetails;
}) {
  const forWorkers = WORKER_COHORTS.has(cohort);
  const [countryIso, setCountryIso] = useState(forWorkers ? "IL" : "");
  const heCountries = COUNTRIES_HE;
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [data, setData] = useState<FormData>({
    firstName: details?.firstName ?? "",
    lastName: details?.lastName ?? "",
    phoneDialCode: "972",
    phone: details?.phone ?? "",
    email: details?.email ?? "",
    role: "",
    communityName: "",
    country: forWorkers ? "ישראל" : "",
    city: "",
    usesAI: "",
    aiTools: [],
    paysForAI: "",
    aiLevel: "",
    usesCodeAI: "",
    paysForClaude: "",
    usesClaudeAPI: "",
    communityChallenge: "",
    communicationChallenge: "",
    expectations: "",
  });

  useEffect(() => {
    if (forWorkers) return; // עברית — רשימה מקומית, בלי API חיצוני
    fetch("https://countriesnow.space/api/v0.1/countries/positions")
      .then((r) => r.json())
      .then((json) => {
        const names: string[] = (json.data ?? []).map(
          (c: { name: string }) => c.name
        );
        setCountries(names.sort((a, b) => a.localeCompare(b)));
      })
      .catch(() => setCountries([]));
  }, [forWorkers]);

  function setHebrewCountry(iso: string) {
    setCountryIso(iso);
    const name = heCountries.find((c) => c.iso === iso)?.name ?? "";
    setData((prev) => ({ ...prev, country: name, city: "" }));
  }

  function set(key: keyof FormData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function setCountry(country: string) {
    setData((prev) => ({ ...prev, country, city: "" }));
    setCities([]);
    if (!country) return;
    setCitiesLoading(true);
    fetch(
      `https://countriesnow.space/api/v0.1/countries/cities/q?country=${encodeURIComponent(
        country
      )}`
    )
      .then((r) => r.json())
      .then((json) => setCities((json.data ?? []).sort((a: string, b: string) => a.localeCompare(b))))
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }

  function toggleTool(tool: string) {
    setData((prev) => ({
      ...prev,
      aiTools: prev.aiTools.includes(tool)
        ? prev.aiTools.filter((t) => t !== tool)
        : [...prev.aiTools, tool],
    }));
  }

  const emailValid = EMAIL_REGEX.test(data.email);

  const step1Valid =
    (details ||
      (data.firstName && data.lastName && data.phone && emailValid)) &&
    data.role &&
    data.country &&
    data.city;

  const usesAIYes = data.usesAI === "כן";
  const hasClaudeSelected = data.aiTools.includes("Claude");

  const step2Valid =
    data.usesAI &&
    (!usesAIYes ||
      (data.aiTools.length > 0 &&
        data.paysForAI &&
        data.aiLevel &&
        data.usesCodeAI &&
        (!hasClaudeSelected || (data.paysForClaude && data.usesClaudeAPI))));

  const step3Valid =
    data.communityChallenge && data.communicationChallenge && data.expectations;

  async function handleDetailsSubmit(d: RegistrationDetails) {
    setStatus("loading");
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          { source: "workers-registration-details", ...data, aiTools: data.aiTools.join(", "), timestamp: new Date().toISOString() },
        ]),
      }).catch(() => undefined);
      const res = await fetch("/api/rabanim/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rid: d.rid,
          sig: d.sig,
          role: data.role,
          communityName: data.communityName,
          location: `${data.city}, ${data.country}`,
        }),
      });
      if (!res.ok) throw new Error("details failed");
      try {
        localStorage.setItem("rabanim_firstName", data.firstName);
        localStorage.setItem("rabanim_lastName", data.lastName);
        localStorage.setItem("rabanim_role", data.role);
        localStorage.setItem("rabanim_cohort", cohort);
        localStorage.setItem("rabanim_paysForClaude", data.paysForClaude);
        localStorage.setItem("rabanim_usesClaudeAPI", data.usesClaudeAPI);
      } catch {
        // רק לנוחות בדף התודה
      }
      window.location.href = "/todah";
    } catch {
      setStatus("error");
    }
  }

  async function handleSubmit(paymentMethod?: "credit" | "bit") {
    if (details) return handleDetailsSubmit(details);
    setStatus("loading");
    try {
      // שליחת נתונים ל-Boost.space
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            source: forWorkers ? "workers-registration" : "rabanim-registration",
            ...data,
            aiTools: data.aiTools.join(", "),
            timestamp: new Date().toISOString(),
          },
        ]),
      });

      localStorage.setItem("rabanim_firstName", data.firstName);
      localStorage.setItem("rabanim_lastName", data.lastName);
      localStorage.setItem("rabanim_role", data.role);
      localStorage.setItem("rabanim_cohort", cohort);
      localStorage.setItem("rabanim_paysForClaude", data.paysForClaude);
      localStorage.setItem("rabanim_usesClaudeAPI", data.usesClaudeAPI);

      const fullPhone = `${data.phoneDialCode}${data.phone.replace(/^0+/, "")}`;
      const location = `${data.city}, ${data.country}`;

      const checkoutRes = await fetch("/api/rabanim/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: fullPhone,
          role: data.role,
          communityName: data.communityName,
          location,
          referralCode,
          cohort,
          paymentMethod,
        }),
      });

      if (!checkoutRes.ok) throw new Error("checkout failed");
      const { url } = await checkoutRes.json();
      window.location.href = url;
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              n <= step ? "bg-brand-accent" : "bg-brand-card"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8 text-right">
              <h1 className="text-3xl font-black text-white leading-snug">
                {forWorkers ? "שלום" : "שלום כבוד הרב"}{" "}
                {(data.firstName || data.lastName) && (
                  <span className="text-brand-accent">
                    {`${data.firstName} ${data.lastName}`.trim()}{" "}
                  </span>
                )}
                {!forWorkers && "שליט״א"}
              </h1>
              {(ROLE_LABELS[data.role] || data.communityName) && (
                <p className="text-brand-accent/80 font-semibold text-lg mt-1">
                  {ROLE_LABELS[data.role]}
                  {ROLE_LABELS[data.role] && data.communityName ? " " : ""}
                  {data.communityName}
                </p>
              )}
              <p className="text-slate-400 mt-2 text-base">
                {details
                  ? "🎉 התשלום התקבל! עוד כמה שאלות קצרות — כדי שנתאים את הסדנה בדיוק לעבודה שלך"
                  : "אנא מלא את הפרטים הבאים כדי להשלים את הרשמתך לסדנה"}
              </p>
            </div>

            <div className="space-y-4">
              {!details && (<>
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="שם פרטי"
                  value={data.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="שם משפחה"
                  value={data.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="טלפון"
                  value={data.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputBaseClass + " flex-1 min-w-0"}
                />
                <select
                  value={data.phoneDialCode}
                  onChange={(e) => set("phoneDialCode", e.target.value)}
                  className={inputBaseClass + " w-24 flex-none truncate text-sm"}
                >
                  {DIAL_CODES.map((c) => (
                    <option key={c.iso2} value={c.dialCode}>
                      +{c.dialCode} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="email"
                  placeholder="מייל"
                  value={data.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputClass}
                />
                {data.email.length > 0 && !emailValid && (
                  <p className="text-red-400 text-sm mt-1">כתובת מייל לא תקינה</p>
                )}
              </div>
              </>)}
              <select
                value={data.role}
                onChange={(e) => set("role", e.target.value)}
                className={inputClass}
              >
                <option value="">{forWorkers ? "מה אתה עושה היום?" : "תפקיד"}</option>
                {(forWorkers ? WORKER_ROLES : RABBI_ROLES).map((key) => (
                  <option key={key} value={key}>
                    {key === "other" ? "אחר" : key === "rav-rashi" ? "רב ראשי" : ROLE_LABELS[key]}
                  </option>
                ))}
              </select>
              {data.role && (
                <input
                  placeholder={forWorkers ? "תחום / מקום העבודה" : "שם הקהילה / המוסד"}
                  value={data.communityName}
                  onChange={(e) => set("communityName", e.target.value)}
                  className={inputClass}
                />
              )}
              {forWorkers ? (
                <>
                  <select
                    value={countryIso}
                    onChange={(e) => setHebrewCountry(e.target.value)}
                    className={inputClass}
                  >
                    {heCountries.map((c) => (
                      <option key={c.iso} value={c.iso}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    list={CITIES_HE[countryIso] ? "cities-he" : undefined}
                    placeholder="עיר / יישוב"
                    value={data.city}
                    onChange={(e) => set("city", e.target.value)}
                    className={inputClass}
                  />
                  {CITIES_HE[countryIso] && (
                    <datalist id="cities-he">
                      {CITIES_HE[countryIso].map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  )}
                </>
              ) : (<>
              <select
                value={data.country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
              >
                <option value="">מדינה</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={data.city}
                onChange={(e) => set("city", e.target.value)}
                disabled={!data.country || citiesLoading}
                className={inputClass + " disabled:opacity-40"}
              >
                <option value="">
                  {citiesLoading ? "טוען ערים..." : "עיר"}
                </option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              </>)}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="mt-8 w-full py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              המשך ←
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-black text-white mb-1">רמת AI</h2>
            <p className="text-slate-400 mb-8">שלב 2 מתוך 3 — כמה שאלות על הניסיון שלך</p>

            <div className="space-y-7">
              <div>
                <p className="text-white font-semibold mb-3">
                  האם אתה משתמש בכלי AI כיום?
                </p>
                <RadioGroup
                  name="usesAI"
                  options={["כן", "לא"]}
                  value={data.usesAI}
                  onChange={(v) => {
                    set("usesAI", v);
                    if (v === "לא") {
                      setData((prev) => ({
                        ...prev,
                        usesAI: v,
                        aiTools: [],
                        paysForAI: "",
                        aiLevel: "",
                      }));
                    }
                  }}
                />
              </div>

              <AnimatePresence>
                {usesAIYes && (
                  <motion.div
                    key="ai-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-7 overflow-hidden"
                  >
                    <div>
                      <p className="text-white font-semibold mb-3">
                        באיזה כלים? (אפשר לבחור כמה)
                      </p>
                      <div className="space-y-2">
                        {["ChatGPT", "Claude", "Gemini", "Perplexity", "אחר"].map((tool) => (
                          <label
                            key={tool}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                              data.aiTools.includes(tool)
                                ? "border-brand-accent bg-brand-dark"
                                : "border-brand-accent/30 bg-brand-card hover:border-brand-accent/60"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={data.aiTools.includes(tool)}
                              onChange={() => toggleTool(tool)}
                              className="accent-brand-accent w-4 h-4"
                            />
                            <span className="text-white">{tool}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-white font-semibold mb-3">
                        האם אתה משלם על כלי AI?
                      </p>
                      <RadioGroup
                        name="paysForAI"
                        options={["כן, משלם", "לא, רק גרסה חינמית"]}
                        value={data.paysForAI}
                        onChange={(v) => set("paysForAI", v)}
                      />
                    </div>

                    <div>
                      <p className="text-white font-semibold mb-3">
                        איך תתאר את רמתך עם AI?
                      </p>
                      <RadioGroup
                        name="aiLevel"
                        options={[
                          "מתחיל — ניסיתי כמה פעמים",
                          "מתנסה — משתמש מדי פעם",
                          "בשימוש קבוע — כלי עבודה יומי",
                        ]}
                        value={data.aiLevel}
                        onChange={(v) => set("aiLevel", v)}
                      />
                    </div>

                    <div>
                      <p className="text-white font-semibold mb-3">
                        האם השתמשת בכלי AI לכתיבת קוד?
                      </p>
                      <RadioGroup
                        name="usesCodeAI"
                        options={[
                          "לא, בכלל לא נגעתי בזה",
                          "שמעתי אבל לא ניסיתי",
                          "ניסיתי (Cursor / Copilot / Claude Code)",
                          "כן, בשימוש קבוע",
                        ]}
                        value={data.usesCodeAI}
                        onChange={(v) => set("usesCodeAI", v)}
                      />
                    </div>

                    {hasClaudeSelected && (
                      <>
                        <div>
                          <p className="text-white font-semibold mb-3">
                            האם אתה משלם על Claude (גרסת Pro)?
                          </p>
                          <RadioGroup
                            name="paysForClaude"
                            options={["כן, יש לי Pro", "לא, רק גרסה חינמית"]}
                            value={data.paysForClaude}
                            onChange={(v) => set("paysForClaude", v)}
                          />
                        </div>

                        <div>
                          <p className="text-white font-semibold mb-3">
                            האם יש לך גישה ל-Claude API?
                          </p>
                          <RadioGroup
                            name="usesClaudeAPI"
                            options={["כן, יש לי גישה", "לא"]}
                            value={data.usesClaudeAPI}
                            onChange={(v) => set("usesClaudeAPI", v)}
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 rounded-xl border border-brand-accent/40 text-white hover:bg-brand-card transition-colors"
              >
                → חזור
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className="flex-1 py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                המשך ←
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-black text-white mb-1">
              {forWorkers ? "העבודה שלך" : "הקהילה שלך"}
            </h2>
            <p className="text-slate-400 mb-8">שלב 3 מתוך 3 — כמה שאלות אחרונות</p>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  {forWorkers
                    ? "מה לוקח לך הכי הרבה זמן בעבודה?"
                    : "מה לוקח לך הכי הרבה זמן בניהול הקהילה?"}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    forWorkers
                      ? "לדוגמה: דוחות, אקסלים, מענה למיילים, הצעות מחיר..."
                      : "לדוגמה: כתיבת דרשות, מענה לשאלות, תיאום אירועים..."
                  }
                  value={data.communityChallenge}
                  onChange={(e) => set("communityChallenge", e.target.value)}
                  className={inputClass + " resize-none"}
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">
                  {forWorkers
                    ? "איזו מערכת או כלי היית רוצה שיהיו לך בעבודה?"
                    : "מה מאתגר אותך בתקשורת עם הקהל?"}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    forWorkers
                      ? "לדוגמה: מערכת לניהול לקוחות, דוח שמתעדכן לבד, אפליקציה לצוות..."
                      : "לדוגמה: כתיבת עלונים, הודעות, תוכן לרשתות..."
                  }
                  value={data.communicationChallenge}
                  onChange={(e) => set("communicationChallenge", e.target.value)}
                  className={inputClass + " resize-none"}
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">
                  מה תרצה לקחת מהסדנה?
                </label>
                <textarea
                  rows={3}
                  placeholder="מה יחשב לך הצלחה אחרי הסדנה?"
                  value={data.expectations}
                  onChange={(e) => set("expectations", e.target.value)}
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-4 rounded-xl border border-brand-accent/40 text-white hover:bg-brand-card transition-colors"
              >
                → חזור
              </button>
              {details ? (
                <button
                  onClick={() => handleSubmit()}
                  disabled={status === "loading" || !step3Valid}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {status === "loading" ? "שומר..." : "סיום ←"}
                </button>
              ) : MORNING_COHORTS.has(cohort) ? (
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSubmit("credit")}
                    disabled={status === "loading" || !step3Valid}
                    className="py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {status === "loading" ? "שולח..." : "💳 אשראי"}
                  </button>
                  <button
                    onClick={() => handleSubmit("bit")}
                    disabled={status === "loading" || !step3Valid}
                    className="py-4 rounded-xl bg-[#00a3a6] text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {status === "loading" ? "שולח..." : "bit"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSubmit()}
                  disabled={status === "loading" || !step3Valid}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {status === "loading" ? "שולח..." : "לתשלום ←"}
                </button>
              )}
            </div>
            {status === "error" && (
              <p className="text-red-400 text-center mt-4">
                משהו השתבש. נסה שוב.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
