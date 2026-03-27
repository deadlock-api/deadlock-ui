export const SUPPORTED_LANGUAGES = [
  'brazilian',
  'czech',
  'english',
  'french',
  'german',
  'indonesian',
  'italian',
  'japanese',
  'koreana',
  'latam',
  'polish',
  'russian',
  'schinese',
  'spanish',
  'thai',
  'turkish',
  'ukrainian',
] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];
