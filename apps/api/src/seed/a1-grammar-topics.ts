import type {
  GrammarTopicContentInput,
  InternalExercise,
} from "@lingo-deutsch/shared";

export const A1_GRAMMAR_TOPICS = [
  {
    examples: [
      {
        de: "Guten Tag. Wie heißen Sie?",
        vi: "Xin chào. Ông/bà tên là gì?",
      },
      {
        de: "Hallo Anna! Wie heißt du?",
        vi: "Chào Anna! Bạn tên là gì?",
      },
    ],
    level: "A1",
    order: 1,
    published: true,
    relatedLessonSlugs: ["a1-begruessung-und-vorstellung"],
    rules: [
      {
        explanationVi:
          "Dùng Guten Morgen, Guten Tag hoặc Guten Abend theo thời điểm; Hallo phù hợp với tình huống thân mật.",
        id: "grussformeln",
        titleDe: "Grußformeln",
      },
      {
        explanationVi:
          "Dùng du với người thân quen. Dùng Sie viết hoa trong tình huống trang trọng; động từ đi với Sie có dạng giống sie số nhiều.",
        id: "du-und-sie",
        titleDe: "du und Sie",
      },
    ],
    slug: "a1-begruessung-und-anrede",
    summaryVi: "Chọn lời chào và cách xưng hô phù hợp trong lần gặp đầu tiên.",
    titleDe: "Begrüßung und Anrede",
    titleVi: "Chào hỏi và xưng hô",
  },
  {
    compactTable: {
      captionVi: "Đại từ nhân xưng làm chủ ngữ",
      headers: ["Ngôi", "Số ít", "Số nhiều"],
      rows: [
        ["Ngôi 1", "ich", "wir"],
        ["Ngôi 2", "du", "ihr"],
        ["Ngôi 3", "er / sie / es", "sie"],
        ["Trang trọng", "Sie", "Sie"],
      ],
    },
    examples: [
      { de: "Ich komme aus Vietnam.", vi: "Tôi đến từ Việt Nam." },
      { de: "Sie sprechen Deutsch.", vi: "Ông/bà nói tiếng Đức." },
    ],
    level: "A1",
    order: 2,
    published: true,
    relatedLessonSlugs: ["a1-begruessung-und-vorstellung"],
    rules: [
      {
        explanationVi:
          "Đại từ nhân xưng đứng ở vị trí chủ ngữ và quyết định dạng chia của động từ.",
        id: "subjekt-und-verb",
        titleDe: "Subjekt und Verb",
      },
      {
        explanationVi:
          "sie có thể là cô ấy hoặc họ; Sie viết hoa là cách xưng hô trang trọng.",
        id: "sie-bedeutungen",
        titleDe: "sie und Sie",
      },
    ],
    slug: "a1-personalpronomen",
    summaryVi: "Dùng ich, du, er/sie/es, wir, ihr, sie và Sie làm chủ ngữ.",
    titleDe: "Personalpronomen",
    titleVi: "Đại từ nhân xưng",
  },
  {
    compactTable: {
      captionVi: "sein và haben ở thì Präsens",
      headers: ["Đại từ", "sein", "haben"],
      rows: [
        ["ich", "bin", "habe"],
        ["du", "bist", "hast"],
        ["er / sie / es", "ist", "hat"],
        ["wir", "sind", "haben"],
        ["ihr", "seid", "habt"],
        ["sie / Sie", "sind", "haben"],
      ],
    },
    examples: [
      {
        de: "Ich bin neu im Sprachkurs.",
        vi: "Tôi mới tham gia lớp tiếng Đức.",
      },
      { de: "Du bist pünktlich.", vi: "Bạn đúng giờ." },
      {
        de: "Haben Sie morgen Zeit?",
        vi: "Ngày mai ông/bà có thời gian không?",
      },
    ],
    level: "A1",
    order: 3,
    published: true,
    relatedLessonSlugs: [
      "a1-begruessung-und-vorstellung",
      "a1-uhrzeit-und-termine",
    ],
    rules: [
      {
        explanationVi:
          "sein diễn tả danh tính hoặc trạng thái; các dạng bin, bist, ist, sind và seid cần được học riêng.",
        id: "sein-gebrauch",
        titleDe: "sein",
      },
      {
        explanationVi:
          "haben diễn tả sự sở hữu hoặc điều đang có, ví dụ einen Termin haben.",
        id: "haben-gebrauch",
        titleDe: "haben",
      },
    ],
    slug: "a1-sein-und-haben",
    summaryVi:
      "Chia và dùng hai động từ cơ bản sein và haben trong câu đơn giản.",
    titleDe: "sein und haben",
    titleVi: "Động từ sein và haben",
  },
  {
    compactTable: {
      captionVi: "Ba giống danh từ trong tiếng Đức",
      headers: ["Mạo từ", "Ví dụ", "Số nhiều"],
      rows: [
        ["der", "der Name", "die Namen"],
        ["die", "die Sprache", "die Sprachen"],
        ["das", "das Lebensmittel", "die Lebensmittel"],
      ],
    },
    examples: [
      { de: "Der Name steht im Formular.", vi: "Tên nằm trong biểu mẫu." },
      {
        de: "Die Sprache ist neu für mich.",
        vi: "Ngôn ngữ này mới đối với tôi.",
      },
      { de: "Das Lebensmittel ist frisch.", vi: "Thực phẩm này còn tươi." },
    ],
    level: "A1",
    order: 4,
    published: true,
    relatedLessonSlugs: [
      "a1-begruessung-und-vorstellung",
      "a1-einkaufen-im-supermarkt",
    ],
    rules: [
      {
        explanationVi:
          "Danh từ tiếng Đức luôn viết hoa và nên được học cùng mạo từ xác định der, die hoặc das.",
        id: "nomen-mit-artikel",
        titleDe: "Nomen mit Artikel",
      },
      {
        explanationVi:
          "Khi có dạng số nhiều, hãy học cùng danh từ; mạo từ xác định ở số nhiều luôn là die.",
        id: "plural-lernen",
        titleDe: "Plural mitlernen",
      },
    ],
    slug: "a1-artikel-der-die-das",
    summaryVi: "Học danh từ cùng giống, mạo từ xác định và dạng số nhiều.",
    titleDe: "Artikel: der, die, das",
    titleVi: "Danh từ và mạo từ",
  },
  {
    compactTable: {
      captionVi: "Đuôi động từ đều ở thì Präsens",
      headers: ["Đại từ", "lernen", "arbeiten"],
      rows: [
        ["ich", "lerne", "arbeite"],
        ["du", "lernst", "arbeitest"],
        ["er / sie / es", "lernt", "arbeitet"],
        ["wir", "lernen", "arbeiten"],
        ["ihr", "lernt", "arbeitet"],
        ["sie / Sie", "lernen", "arbeiten"],
      ],
    },
    examples: [
      {
        de: "Ich lerne jeden Abend Deutsch.",
        vi: "Tôi học tiếng Đức mỗi tối.",
      },
      {
        de: "Er arbeitet in einem Hotel.",
        vi: "Anh ấy làm việc trong một khách sạn.",
      },
    ],
    level: "A1",
    order: 5,
    published: true,
    relatedLessonSlugs: [
      "a1-begruessung-und-vorstellung",
      "a1-beruf-und-bewerbung",
    ],
    rules: [
      {
        explanationVi:
          "Với động từ đều, bỏ -en để lấy thân động từ rồi thêm đuôi theo chủ ngữ: -e, -st, -t, -en, -t, -en.",
        id: "stamm-und-endung",
        titleDe: "Stamm und Endung",
      },
      {
        explanationVi:
          "Nếu thân động từ kết thúc bằng -t hoặc -d, thường thêm e trước đuôi -st và -t: du arbeitest, er arbeitet.",
        id: "e-einschub",
        titleDe: "Verben auf -t und -d",
      },
    ],
    slug: "a1-praesens",
    summaryVi: "Chia động từ đều ở thì Präsens và nhận biết trường hợp thêm e.",
    titleDe: "Präsens: regelmäßige Verben",
    titleVi: "Chia động từ ở thì hiện tại",
  },
] satisfies GrammarTopicContentInput[];

export const A1_GRAMMAR_EXERCISES: Record<string, InternalExercise[]> = {
  "a1-begruessung-und-anrede": [
    {
      correctOptionId: "formal-sie",
      feedbackCorrectVi:
        "Đúng: Sie viết hoa dùng cho cách xưng hô trang trọng.",
      feedbackIncorrectVi: "Trong tình huống trang trọng, dùng Sie viết hoa.",
      id: "greeting-register",
      instructionVi: "Chọn đại từ xưng hô phù hợp với nhân viên hành chính.",
      options: [
        { id: "informal-du", text: "du" },
        { id: "formal-sie", text: "Sie" },
        { id: "plural-ihr", text: "ihr" },
      ],
      promptDe: "Wie heißen ___?",
      type: "multiple_choice",
    },
  ],
  "a1-personalpronomen": [
    {
      acceptedAnswers: ["wir"],
      caseSensitive: false,
      feedbackCorrectVi: "Đúng: wir là đại từ ngôi thứ nhất số nhiều.",
      feedbackIncorrectVi: "Khi nói “chúng tôi/chúng ta”, dùng wir.",
      id: "pronoun-wir",
      instructionVi: "Điền đại từ nhân xưng còn thiếu.",
      promptDe: "Anna und ich lernen Deutsch. ___ lernen zusammen.",
      type: "fill_blank",
    },
  ],
  "a1-sein-und-haben": [
    {
      correctOrder: ["ich", "habe", "einen", "termin"],
      feedbackCorrectVi: "Đúng: với ich, haben được chia thành habe.",
      feedbackIncorrectVi: "Dùng cấu trúc Ich habe einen Termin.",
      id: "haben-termin",
      instructionVi: "Sắp xếp thành câu đúng.",
      tokens: [
        { id: "termin", text: "Termin." },
        { id: "ich", text: "Ich" },
        { id: "einen", text: "einen" },
        { id: "habe", text: "habe" },
      ],
      type: "word_ordering",
    },
  ],
  "a1-artikel-der-die-das": [
    {
      correctOptionId: "der-termin",
      feedbackCorrectVi: "Đúng: Termin là danh từ giống đực: der Termin.",
      feedbackIncorrectVi: "Học danh từ cùng mạo từ: der Termin.",
      id: "article-termin",
      instructionVi: "Chọn mạo từ đúng.",
      options: [
        { id: "der-termin", text: "der Termin" },
        { id: "die-termin", text: "die Termin" },
        { id: "das-termin", text: "das Termin" },
      ],
      promptDe: "Welcher Artikel gehört zu Termin?",
      type: "multiple_choice",
    },
  ],
  "a1-praesens": [
    {
      acceptedAnswers: ["arbeitet"],
      caseSensitive: false,
      feedbackCorrectVi: "Đúng: với er, arbeiten được chia thành arbeitet.",
      feedbackIncorrectVi: "Thân từ kết thúc bằng -t nên thêm -et: arbeitet.",
      id: "praesens-arbeiten",
      instructionVi: "Điền dạng Präsens đúng.",
      promptDe: "Er ___ in einem Hotel.",
      type: "fill_blank",
    },
  ],
};
