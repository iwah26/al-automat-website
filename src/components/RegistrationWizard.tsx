"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DIAL_CODES } from "@/lib/dialCodes";

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
};

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

export function RegistrationWizard() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [data, setData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneDialCode: "972",
    phone: "",
    email: "",
    role: "",
    communityName: "",
    country: "",
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
    fetch("https://countriesnow.space/api/v0.1/countries/positions")
      .then((r) => r.json())
      .then((json) => {
        const names: string[] = (json.data ?? []).map(
          (c: { name: string }) => c.name
        );
        setCountries(names.sort((a, b) => a.localeCompare(b)));
      })
      .catch(() => setCountries([]));
  }, []);

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
    data.firstName &&
    data.lastName &&
    data.phone &&
    emailValid &&
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

  async function handleSubmit() {
    setStatus("loading");
    try {
      // שליחת נתונים ל-Boost.space
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            source: "rabanim-registration",
            ...data,
            aiTools: data.aiTools.join(", "),
            timestamp: new Date().toISOString(),
          },
        ]),
      });

      localStorage.setItem("rabanim_firstName", data.firstName);
      localStorage.setItem("rabanim_lastName", data.lastName);
      localStorage.setItem("rabanim_role", data.role);
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
                שלום כבוד הרב{" "}
                {(data.firstName || data.lastName) && (
                  <span className="text-brand-accent">
                    {`${data.firstName} ${data.lastName}`.trim()}{" "}
                  </span>
                )}
                שליט״א
              </h1>
              {(ROLE_LABELS[data.role] || data.communityName) && (
                <p className="text-brand-accent/80 font-semibold text-lg mt-1">
                  {ROLE_LABELS[data.role]}
                  {ROLE_LABELS[data.role] && data.communityName ? " " : ""}
                  {data.communityName}
                </p>
              )}
              <p className="text-slate-400 mt-2 text-base">
                אנא מלא את הפרטים הבאים כדי להשלים את הרשמתך לסדנה
              </p>
            </div>

            <div className="space-y-4">
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
              <select
                value={data.role}
                onChange={(e) => set("role", e.target.value)}
                className={inputClass}
              >
                <option value="">תפקיד</option>
                <option value="avreich">אברך</option>
                <option value="rav-kehila">רב קהילה</option>
                <option value="rav-rashi">רב ראשי</option>
                <option value="rav-yeshiva">רב בישיבה</option>
                <option value="menahel">מנהל מוסד</option>
                <option value="menahel-beit-sefer">מנהל בית ספר</option>
                <option value="melamed-beit-sefer">מלמד בבית ספר</option>
                <option value="other">אחר</option>
              </select>
              {data.role && (
                <input
                  placeholder="שם הקהילה / המוסד"
                  value={data.communityName}
                  onChange={(e) => set("communityName", e.target.value)}
                  className={inputClass}
                />
              )}
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
            <h2 className="text-3xl font-black text-white mb-1">הקהילה שלך</h2>
            <p className="text-slate-400 mb-8">שלב 3 מתוך 3 — כמה שאלות אחרונות</p>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  מה לוקח לך הכי הרבה זמן בניהול הקהילה?
                </label>
                <textarea
                  rows={3}
                  placeholder="לדוגמה: כתיבת דרשות, מענה לשאלות, תיאום אירועים..."
                  value={data.communityChallenge}
                  onChange={(e) => set("communityChallenge", e.target.value)}
                  className={inputClass + " resize-none"}
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">
                  מה מאתגר אותך בתקשורת עם הקהל?
                </label>
                <textarea
                  rows={3}
                  placeholder="לדוגמה: כתיבת עלונים, הודעות, תוכן לרשתות..."
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
              <button
                onClick={handleSubmit}
                disabled={status === "loading" || !step3Valid}
                className="flex-1 py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {status === "loading" ? "שולח..." : "לתשלום ←"}
              </button>
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
