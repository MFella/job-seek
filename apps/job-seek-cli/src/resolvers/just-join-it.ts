export interface JustJoinItJobApiResponse {
  data: JustJoinItJobOffer[];
  meta: JustJoinItMetaInfo;
}

export interface JustJoinItJobOffer {
  guid: string;
  slug: string;
  title: string;
  workplaceType: WorkplaceType;
  workingTime: WorkingTime;
  experienceLevel: ExperienceLevel;
  category: Category;
  city: string;
  street: string;
  latitude: number;
  longitude: number;
  isRemoteInterview: boolean;
  companyName: string;
  companyLogoThumbUrl: string;
  publishedAt: string;
  isOpenToHireUkrainians: boolean;
  locations: Location[];
  employmentTypes: EmploymentType[];
  requiredSkills: Skill[];
  niceToHaveSkills: Skill[];
  languages: Language[];
  isPromoted: boolean;
  isSuperOffer: boolean;
  applyMethod: ApplyMethod;
  lastPublishedAt: Date;
  expiredAt: Date;
}

export interface JustJoinItDetailedJobOffer extends Omit<
  JustJoinItJobOffer,
  'guid'
> {
  id: string;
  slug: string;
  companyUrl: string;
  // HTML description of the job offer
  body: string;
  locationId: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  companySize: string;
  informationClause: string;
  futureConsent: string;
  customConsent: string;
  companyLogoUrl: string;
  applyUrl: string;
  companyProfileSlug: string | null;
  companyProfileCoverPhotoUrl: string | null;
  companyProfileShortDescription: string | null;
  videoUrl: string | null;
  bannerUrl: string | null;
}

export enum ApplyMethod {
  External = 'external',
  Form = 'form',
}

export interface Category {
  key: Key;
  parentKey: null;
}

export enum Key {
  Architecture = 'architecture',
  Java = 'java',
  Javascript = 'javascript',
  Net = 'net',
  Other = 'other',
  PHP = 'php',
  Python = 'python',
  UX = 'ux',
}

export interface EmploymentType {
  from: number | null;
  fromPerUnit: number | null;
  to: number | null;
  toPerUnit: number | null;
  currency: Currency;
  currencySource: CurrencySource;
  type: Type;
  unit: Unit;
  gross: boolean;
}

export enum Currency {
  Chf = 'CHF',
  Eur = 'EUR',
  Gbp = 'GBP',
  Pln = 'PLN',
  Usd = 'USD',
}

export enum CurrencySource {
  Conversion = 'conversion',
  Original = 'original',
}

export enum Type {
  Any = 'any',
  B2B = 'b2b',
  Permanent = 'permanent',
}

export enum Unit {
  Day = 'Day',
  Hour = 'Hour',
  Month = 'Month',
  UnitMonth = 'month',
}

export enum ExperienceLevel {
  Junior = 'junior',
  Mid = 'mid',
  Senior = 'senior',
}

export interface Language {
  code: Code;
  level: Level;
}

export enum Code {
  De = 'de',
  En = 'en',
  Pl = 'pl',
}

export enum Level {
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export interface Location {
  city: string;
  street: string;
  latitude: number;
  longitude: number;
  slug: string;
}

export interface Skill {
  name: string;
  level: number;
}

export enum WorkingTime {
  Freelance = 'freelance',
  FullTime = 'full_time',
}

export enum WorkplaceType {
  Hybrid = 'hybrid',
  Office = 'office',
  Remote = 'remote',
}

export interface JustJoinItMetaInfo {
  from: number;
  totalItems: number;
  prev: Next;
  next: Next;
}

export interface Next {
  cursor: number | null;
  itemsCount: number;
}
