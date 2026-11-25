import type { LessonBundle, Student, TeacherTask } from '../types';

export const INITIAL_BUNDLES: LessonBundle[] = [
  {
    id: 'bundle-quad-eq',
    title: 'Kvadrat tenglamalar va diskriminant usuli',
    topic: 'Kvadrat tenglamalar',
    subject: 'Matematika',
    grade: '8-sinf',
    durationMinutes: 45,
    summary:
      "O'quvchilarga to'liq kvadrat tenglamalarni diskriminant formulasi yordamida yechish, ildizlar sonini aniqlash va hayotiy masalalarga tatbiq etish ko'nikmasini shakllantirish darsi.",
    createdAt: '2026-11-20T09:30:00.000Z',
    lessonPlan: {
      objectives: [
        'ax² + bx + c = 0 ko‘rinishidagi kvadrat tenglama koeffitsientlarini ajrata olish',
        'D = b² - 4ac diskriminant qiymatiga ko‘ra tenglama ildizlari sonini aniqlash',
        'Diskriminant formulasini amaliy va geometrik masalalarda qo‘llash',
      ],
      materialsNeeded: [
        'Interaktiv doska va rangli markerlar',
        'Har bir guruh uchun 3 xil murakkablikdagi kartochkalar to‘plami',
        'Tezkor formulalar varaqasi (tarqatma material)',
      ],
      stages: [
        {
          name: '1. Tashkiliy qism va aqliy hujum',
          durationMinutes: 7,
          teacherAction:
            'Chiziqli tenglamalardan kvadrat tenglamaga o‘tish muammoli savolini doskaga yozadi (To‘g‘ri to‘rtburchak yuzasi masalasi).',
          studentAction:
            'Savolga og‘zaki yechim izlaydi va x² ishtirok etgan tenglama hosil qiladi.',
        },
        {
          name: '2. Yangi mavzu bayoni',
          durationMinutes: 15,
          teacherAction:
            'Diskriminant D = b² - 4ac formulasini keltirib chiqaradi va D > 0, D = 0, D < 0 holatlarini misollar bilan tushuntiradi.',
          studentAction:
            'Asosiy formulalarni daftarga yozib oladi va 3 ta holat bo‘yicha qisqa jadval tuzadi.',
        },
        {
          name: '3. Juftlikda amaliy mashq',
          durationMinutes: 13,
          teacherAction:
            'Sinfni juftliklarga bo‘lib, har biriga 3 darajali misollar beradi va qiynalgan o‘quvchilarga yo‘naltiruvchi savollar beradi.',
          studentAction:
            'Juftlikda tenglamalarni yechadi, javoblarni o‘zaro tekshiradi.',
        },
        {
          name: '4. Mustahkamlash va tezkor test',
          durationMinutes: 7,
          teacherAction: '5 daqiqalik qisqa nazorat savollarini tarqatadi.',
          studentAction: 'Mustaqil ravishda savollarga javob belgilaydi.',
        },
        {
          name: '5. Xulosa va uyga vazifa',
          durationMinutes: 3,
          teacherAction:
            'Dars maqsadlariga erishilganini umumlashtiradi va tabaqalashtirilgan uyga vazifani tushuntiradi.',
          studentAction: 'O‘z-o‘zini baholaydi va uyga vazifani yozib oladi.',
        },
      ],
      differentiation:
        'Asosiy guruh standart butun koeffitsientli tenglamalarni yechadi; iqtidorli o‘quvchilar esa parametrli kvadrat tenglamalar (D = 0 sharti) ustida ishlaydi.',
      assessmentCriteria:
        'Koeffitsientlarni to‘g‘ri aniqlash (2 ball), diskriminantni xatosiz hisoblash (3 ball), ildizlarni topish va tekshirish (5 ball).',
    },
    tests: [
      {
        id: 'q-1',
        question: '2x² - 5x + 2 = 0 kvadrat tenglamaning diskriminanti nimaga teng?',
        type: 'multiple_choice',
        options: ['9', '41', '-9', '25'],
        correctIndex: 0,
        explanation: 'D = (-5)² - 4 · 2 · 2 = 25 - 16 = 9.',
        difficulty: 'Oson',
      },
      {
        id: 'q-2',
        question: 'Agar kvadrat tenglamaning diskriminanti D < 0 bo‘lsa, u nechta haqiqiy ildizga ega?',
        type: 'multiple_choice',
        options: ['2 ta har xil ildiz', '1 ta ildiz', 'Haqiqiy ildizi yo‘q', 'Cheksiz ko‘p ildiz'],
        correctIndex: 2,
        explanation: 'Manfiy sondan haqiqiy kvadrat ildiz chiqmagani uchun D < 0 da haqiqiy ildiz bo‘lmaydi.',
        difficulty: 'Oson',
      },
      {
        id: 'q-3',
        question: 'x² - 6x + 9 = 0 tenglamaning ildizini toping.',
        type: 'multiple_choice',
        options: ['x = -3', 'x = 3', 'x₁ = 3, x₂ = -3', 'Ildizi yo‘q'],
        correctIndex: 1,
        explanation: 'D = 36 - 36 = 0, demak bitta ildiz: x = 6 / 2 = 3.',
        difficulty: "O'rta",
      },
      {
        id: 'q-4',
        question: 'To‘g‘ri to‘rtburchakning bo‘yi enidan 3 sm uzun, yuzasi esa 28 sm². Enini toping.',
        type: 'multiple_choice',
        options: ['4 sm', '7 sm', '5 sm', '6 sm'],
        correctIndex: 0,
        explanation: 'x(x + 3) = 28 → x² + 3x - 28 = 0. Musbat ildizi x = 4 sm.',
        difficulty: 'Qiyin',
      },
    ],
    additionalMaterials: {
      keyConcepts: [
        {
          term: 'Diskriminant (D)',
          definition: 'Kvadrat tenglama ildizlari sonini aniqlab beruvchi D = b² - 4ac ifodasi.',
        },
        {
          term: 'Keltirilgan kvadrat tenglama',
          definition: 'Bosh koeffitsienti a = 1 ga teng bo‘lgan x² + px + q = 0 shaklidagi tenglama.',
        },
      ],
      classroomActivity:
        '“Tenglama estafetasi”: Doskaga 3 qator uchun 3 ta tenglama chiqariladi. 1-o‘quvchi koeffitsientlarni yozadi, 2-o‘quvchi diskriminantni, 3-o‘quvchi ildizlarni topadi.',
      homework:
        'Darslikdan 4 ta asosiy misolni yechish va uydagi biror xona yoki stol yuzasini o‘lchab, unga mos kvadrat tenglama tuzish.',
      realLifeAnalogy:
        'Diskriminantni svetoforga o‘xshatish mumkin: D > 0 — yashil chiroq (2 ta yo‘l/ildiz ochiq), D = 0 — sariq chiroq (bitta aniq yo‘l), D < 0 — qizil chiroq (haqiqiy yechim yo‘q).',
      quickFacts: [
        'Kvadrat tenglamalarni yechishning dastlabki usullari Al-Xorazmiyning “Al-jabr val-muqobala” asarida geometrik usulda bayon etilgan.',
        'Parabolaning OX o‘qi bilan kesishish nuqtalari aynan kvadrat tenglamaning ildizlaridir.',
      ],
    },
  },
  {
    id: 'bundle-photosynthesis',
    title: 'Fotosintez jarayoni va o‘simliklar oziqlanishi',
    topic: 'Fotosintez',
    subject: 'Biologiya',
    grade: '7-sinf',
    durationMinutes: 45,
    summary:
      "Yashil o'simliklarda quyosh nuri ta'sirida organik moddalar hosil bo'lishi, xloroplastlarning roli va kislorod ajralish mexanizmini amaliy misollar bilan o'rganish.",
    createdAt: '2026-11-18T11:15:00.000Z',
    lessonPlan: {
      objectives: [
        'Fotosintez uchun zarur shart-sharoitlarni (yorug‘lik, CO₂, suv, xlorofill) sanab berish',
        'Fotosintezning umumiy tenglamasini tushuntirish',
        'Tabiatda kislorod muvozanati va o‘simliklarning ahamiyatini baholash',
      ],
      materialsNeeded: [
        'Xona o‘simligi bargi va lupa',
        'Fotosintez bosqichlari tasvirlangan sxema',
        'Qisqa laboratoriya kuzatuv varag‘i',
      ],
      stages: [
        {
          name: '1. Qiziqtirish va muammoli savol',
          durationMinutes: 6,
          teacherAction: 'O‘simlik tuproqdan faqat suv va mineral tuz olsa, uning vazni qanday ortadi? savolini qo‘yadi.',
          studentAction: 'Taxminlarini bildiradi va barglarning rolini muhokama qiladi.',
        },
        {
          name: '2. Asosiy jarayon tushuntirilishi',
          durationMinutes: 16,
          teacherAction: 'Xlorofill donachalari, quyosh energiyasi va glyukoza hosil bo‘lishini bosqichma-bosqich chizib ko‘rsatadi.',
          studentAction: 'Sxemani daftariga chizadi va jarayon kirish/chiqish moddalarini belgilaydi.',
        },
        {
          name: '3. Guruhli tahlil ishi',
          durationMinutes: 15,
          teacherAction: 'Har bir guruhga turli muhit sharoitlari (qorong‘i xona, suvsizlik, yorug‘lik) berilgan vaziyatli kartochka tarqatadi.',
          studentAction: 'Sharoit o‘zgarganda fotosintez tezligi qanday o‘zgarishini tushuntiradi.',
        },
        {
          name: '4. Qisqa test va yakun',
          durationMinutes: 8,
          teacherAction: 'Tezkor test o‘tkazadi va uyga kuzatuv topshirig‘ini beradi.',
          studentAction: 'Test savollariga javob beradi.',
        },
      ],
      differentiation:
        'Vizual o‘quvchilar uchun rangli jarayon xaritasi, analitik o‘quvchilar uchun nafas olish va fotosintez jarayonlarini taqqoslash jadvali beriladi.',
      assessmentCriteria:
        'Jarayon komponentlarini to‘g‘ri bog‘lash (4 ball), guruh muhokamasidagi faollik (3 ball), test natijasi (3 ball).',
    },
    tests: [
      {
        id: 'p-1',
        question: 'Fotosintez jarayoni o‘simlik hujayrasining qaysi organoidida sodir bo‘ladi?',
        type: 'multiple_choice',
        options: ['Mitoxondriya', 'Xloroplast', 'Yadro', 'Vakuola'],
        correctIndex: 1,
        explanation: 'Xloroplastlarda xlorofill pigmenti bo‘lib, quyosh nurini yutadi.',
        difficulty: 'Oson',
      },
      {
        id: 'p-2',
        question: 'Fotosintez natijasida atmosferaga qaysi gaz ajralib chiqadi?',
        type: 'multiple_choice',
        options: ['Azot', 'Karbonat angidrid', 'Kislorod', 'Vodorod'],
        correctIndex: 2,
        explanation: 'Suv va karbonat angidriddan glyukoza hosil bo‘lishida qo‘shimcha mahsulot sifatida kislorod ajraladi.',
        difficulty: 'Oson',
      },
      {
        id: 'p-3',
        question: 'Nima uchun kuzda barglar rangi sariq va qizil tusga kiradi?',
        type: 'multiple_choice',
        options: [
          'Suv bug‘lanishi tezlashadi',
          'Yashil xlorofill parchalanib, boshqa pigmentlar ko‘rinadi',
          'Barglarda kislorod to‘planadi',
          'Ildizlar muzlaydi',
        ],
        correctIndex: 1,
        explanation: 'Sovuq tushishi bilan xlorofill sintezi to‘xtaydi va karotinoid pigmentlari ko‘zga tashlanadi.',
        difficulty: "O'rta",
      },
    ],
    additionalMaterials: {
      keyConcepts: [
        { term: 'Xlorofill', definition: 'O‘simliklarga yashil rang beruvchi va quyosh energiyasini yutuvchi pigment.' },
        { term: 'Og‘izchalar', definition: 'Barg po‘stlog‘idagi gaz almashinuvi va suv bug‘lanishini boshqaruvchi teshikchalar.' },
      ],
      classroomActivity:
        '“Quyosh fabrikasi” rol o‘yini: O‘quvchilar suv molekulasi, CO₂, quyosh nuri va glyukoza rollarini bo‘lishib, sinfda jarayonni jonlantiradi.',
      homework: 'Uydagi ikki xil o‘simlikning yorug‘likka nisbatan joylashuvini kuzatib, 5 jumlali xulosa yozish.',
      realLifeAnalogy:
        'Bargni quyosh panelli oshxonaga o‘xshatish mumkin: quyosh nuri — elektr energiyasi, suv va CO₂ — masalliqlar, glyukoza esa tayyor taom.',
      quickFacts: [
        'Yer yuzasidagi kislorodning katta qismini quruqlik o‘rmonlari bilan birga okeandagi mikroskopik suvo‘tlar ishlab chiqaradi.',
      ],
    },
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'st-1',
    name: 'Aziza Karimova',
    grade: '8-A sinf',
    attendanceRate: 98,
    learningStyle: 'Vizual va tizimli',
    notes: "Formulalarni tez eslab qoladi, lekin matnli masalalarda shartni shoshilib o'qiydi.",
    scores: [
      {
        id: 'sc-1',
        subject: 'Matematika',
        topic: 'Kvadrat tenglamalar',
        score: 92,
        maxScore: 100,
        date: '2026-11-20',
      },
      {
        id: 'sc-2',
        subject: 'Fizika',
        topic: "Tekis tezlanuvchan harakat",
        score: 88,
        maxScore: 100,
        date: '2026-11-16',
      },
      {
        id: 'sc-3',
        subject: 'Matematika',
        topic: 'Matnli masalalar',
        score: 76,
        maxScore: 100,
        date: '2026-11-11',
      },
    ],
  },
  {
    id: 'st-2',
    name: 'Boburjon Toshmatov',
    grade: '8-A sinf',
    attendanceRate: 84,
    learningStyle: 'Amaliy (kinestetik)',
    notes: "Og'zaki tushuntirishda faol, biroq yozma hisob-kitoblarda ishora xatolariga yo'l qo'ymoqda.",
    scores: [
      {
        id: 'sc-4',
        subject: 'Matematika',
        topic: 'Kvadrat tenglamalar',
        score: 54,
        maxScore: 100,
        date: '2026-11-20',
      },
      {
        id: 'sc-5',
        subject: 'Matematika',
        topic: 'Viyet teoremasi',
        score: 60,
        maxScore: 100,
        date: '2026-11-14',
      },
      {
        id: 'sc-6',
        subject: 'Fizika',
        topic: 'Nyuton qonunlari',
        score: 68,
        maxScore: 100,
        date: '2026-11-09',
      },
    ],
  },
  {
    id: 'st-3',
    name: 'Madina Rustamova',
    grade: '8-A sinf',
    attendanceRate: 96,
    learningStyle: 'Analitik',
    notes: "Olimpiada masalalariga qiziqishi yuqori, murakkab misollarni mustaqil yechadi.",
    scores: [
      {
        id: 'sc-7',
        subject: 'Matematika',
        topic: 'Kvadrat tenglamalar',
        score: 98,
        maxScore: 100,
        date: '2026-11-20',
      },
      {
        id: 'sc-8',
        subject: 'Matematika',
        topic: 'Tengsizliklar',
        score: 95,
        maxScore: 100,
        date: '2026-11-12',
      },
    ],
  },
  {
    id: 'st-4',
    name: 'Sardorbek Alimov',
    grade: '8-B sinf',
    attendanceRate: 79,
    learningStyle: 'Eshitish orqali',
    notes: "Oxirgi ikki hafta darslarni o'tkazib yuborgani sababli asosiy formulalarda bo'shliq bor.",
    scores: [
      {
        id: 'sc-9',
        subject: 'Matematika',
        topic: 'Kvadrat tenglamalar',
        score: 48,
        maxScore: 100,
        date: '2026-11-20',
      },
      {
        id: 'sc-10',
        subject: 'Matematika',
        topic: 'Ildizlar va darajalar',
        score: 52,
        maxScore: 100,
        date: '2026-11-13',
      },
    ],
  },
  {
    id: 'st-5',
    name: 'Dilnoza Yusupova',
    grade: '7-A sinf',
    attendanceRate: 94,
    learningStyle: 'Vizual',
    notes: "Biologiya va tabiiy fanlarda juda tirishqoq, taqdimotlarni chiroyli tayyorlaydi.",
    scores: [
      {
        id: 'sc-11',
        subject: 'Biologiya',
        topic: 'Fotosintez',
        score: 90,
        maxScore: 100,
        date: '2026-11-18',
      },
      {
        id: 'sc-12',
        subject: 'Biologiya',
        topic: 'Hujayra tuzilishi',
        score: 85,
        maxScore: 100,
        date: '2026-11-10',
      },
    ],
  },
  {
    id: 'st-6',
    name: 'Jasurbek Ergashev',
    grade: '8-B sinf',
    attendanceRate: 91,
    learningStyle: 'Aralash',
    notes: "Barqaror o'zlashtirmoqda, tezlikni oshirish uchun vaqt chegaralangan mashqlar foydali.",
    scores: [
      {
        id: 'sc-13',
        subject: 'Matematika',
        topic: 'Kvadrat tenglamalar',
        score: 78,
        maxScore: 100,
        date: '2026-11-20',
      },
      {
        id: 'sc-14',
        subject: 'Fizika',
        topic: 'Mexanik ish',
        score: 81,
        maxScore: 100,
        date: '2026-11-15',
      },
    ],
  },
];

export const INITIAL_TASKS: TeacherTask[] = [
  {
    id: 'task-1',
    title: "8-A sinf kvadrat tenglamalar testi natijalarini tahlil qilish",
    dueLabel: 'Bugun · 14:00',
    completed: false,
  },
  {
    id: 'task-2',
    title: "Sardorbek Alimov uchun qo'shimcha mustahkamlash topshiriqlarini yuborish",
    dueLabel: 'Ertaga',
    completed: false,
  },
  {
    id: 'task-3',
    title: "7-A sinf biologiya laboratoriya varaqalarini chop etish",
    dueLabel: 'Bajarildi',
    completed: true,
  },
];
