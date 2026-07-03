import { allCountries } from "country-telephone-data";

export interface DialCode {
  name: string;
  iso2: string;
  dialCode: string;
}

function cleanName(name: string): string {
  return name.replace(/\s*\(.*\)\s*$/, "").trim();
}

const PRIORITY_ISO2 = ["il", "us", "gb", "es", "fr", "ar", "ve", "mx"];

const cleaned: DialCode[] = allCountries.map((c) => ({
  name: cleanName(c.name),
  iso2: c.iso2,
  dialCode: c.dialCode,
}));

const priority = PRIORITY_ISO2
  .map((iso2) => cleaned.find((c) => c.iso2 === iso2))
  .filter((c): c is DialCode => Boolean(c));

const rest = cleaned
  .filter((c) => !PRIORITY_ISO2.includes(c.iso2))
  .sort((a, b) => a.name.localeCompare(b.name));

export const DIAL_CODES: DialCode[] = [...priority, ...rest];
