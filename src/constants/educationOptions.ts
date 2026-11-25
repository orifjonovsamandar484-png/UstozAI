export interface LevelGroup {
  label: string;
  options: string[];
}

export const EDUCATION_LEVEL_GROUPS: LevelGroup[] = [
  {
    label: 'Oliy ta’lim (OTM)',
    options: [
      'OTM — Bakalavr (1-kurs)',
      'OTM — Bakalavr (2-kurs)',
      'OTM — Bakalavr (3-kurs)',
      'OTM — Bakalavr (4-kurs)',
      'OTM — Magistratura',
      "OTM — Sirtqi / Kechki ta'lim",
    ],
  },
  {
    label: "Umumta'lim maktabi (1–11-sinf)",
    options: [
      '1-sinf',
      '2-sinf',
      '3-sinf',
      '4-sinf',
      '5-sinf',
      '6-sinf',
      '7-sinf',
      '8-sinf',
      '9-sinf',
      '10-sinf',
      '11-sinf',
    ],
  },
  {
    label: 'Litsey, texnikum va abituriyentlar',
    options: [
      'Abituriyent (OTMga tayyorlov)',
      'Akademik litsey (1-kurs)',
      'Akademik litsey (2-kurs)',
      'Kasb-hunar / Texnikum',
    ],
  },
  {
    label: "O'quv markazi, til kurslari va bog'cha",
    options: [
      "Maktabgacha ta'lim (5–6 yosh)",
      'Boshlang‘ich daraja (A1–A2)',
      'O‘rta daraja (B1–B2)',
      'Yuqori daraja (C1 / IELTS)',
      'IT va kasbiy kurslar',
    ],
  },
];

export const SUBJECT_OPTIONS: string[] = [
  'Matematika',
  'Oliy matematika',
  'Informatika va Dasturlash',
  "Algoritmlar va ma'lumotlar tuzilmasi",
  'Fizika',
  'Biologiya',
  'Kimyo',
  'Iqtisodiyot va Moliya',
  'Menejment va Marketing',
  'Huquqshunoslik',
  'Pedagogika va Psixologiya',
  'Falsafa va Sotsiologiya',
  'Ingliz tili',
  'Ona tili va adabiyot',
  'Tarix',
  'Geografiya',
  'Rus tili',
  'Tibbiyot va Anatomiya',
  'Dizayn va Muhandislik',
];
