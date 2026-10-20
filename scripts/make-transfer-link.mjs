// קישור הרשמה למי ששילם בהעברה בנקאית. הרצה: node scripts/make-transfer-link.mjs <מספר לומדים>
import { randomBytes, createHmac } from "node:crypto";
import fs from "node:fs";
const SECRET = fs.readFileSync(new URL("../src/lib/manualVoucher.ts", import.meta.url), "utf8").match(/const SECRET = "([0-9a-f]+)"/)[1];
const n = Number(process.argv[2] || 1);
const v = randomBytes(5).toString("hex");
const s = createHmac("sha256", SECRET).update(`${v}:${n}`).digest("hex").slice(0, 20);
console.log(`https://www.al-automat.co.il/sadna/manual?v=${v}&n=${n}&s=${s}`);
