declare module "country-telephone-data" {
  export interface CountryTelephoneEntry {
    name: string;
    iso2: string;
    dialCode: string;
    priority?: number;
    format?: string;
  }

  export const allCountries: CountryTelephoneEntry[];
}
