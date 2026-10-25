import {
  vocabularySeedItemSchema,
  type VocabularySeedItem,
} from "@lingo-deutsch/shared";

export type LessonSeed = {
  content: { activities: unknown[] };
  estimatedMinutes: number;
  lessonOrder: number;
  level: "A1";
  moduleOrder: number;
  objectiveVi: string;
  published: boolean;
  slug: string;
  titleDe: string;
  titleVi: string;
  vocabularySeed: VocabularySeedItem[];
};

function item(input: Record<string, unknown>): VocabularySeedItem {
  return vocabularySeedItemSchema.parse({ level: "A1", ...input });
}

export const A1_LESSONS: LessonSeed[] = [
  {
    content: { activities: [] },
    estimatedMinutes: 15,
    lessonOrder: 1,
    level: "A1",
    moduleOrder: 1,
    objectiveVi: "Giới thiệu tên, nơi ở và ngôn ngữ bằng cách xưng hô phù hợp.",
    published: true,
    slug: "a1-begruessung-und-vorstellung",
    titleDe: "Begrüßung und Vorstellung",
    titleVi: "Chào hỏi và giới thiệu",
    vocabularySeed: [
      item({
        article: "der",
        examples: [{ de: "Mein Name ist Long.", vi: "Tên tôi là Long." }],
        headword: "Name",
        meaningsVi: ["tên"],
        plural: "die Namen",
        wordType: "noun",
      }),
      item({
        article: "der",
        examples: [
          { de: "Mein Vorname ist Long.", vi: "Tên của tôi là Long." },
        ],
        headword: "Vorname",
        meaningsVi: ["tên gọi"],
        plural: "die Vornamen",
        wordType: "noun",
      }),
      item({
        examples: [{ de: "Wie heißen Sie?", vi: "Ông/bà tên là gì?" }],
        headword: "heißen",
        meaningsVi: ["tên là"],
        wordType: "verb",
      }),
      item({
        examples: [
          { de: "Ich komme aus Vietnam.", vi: "Tôi đến từ Việt Nam." },
        ],
        headword: "kommen",
        meaningsVi: ["đến"],
        wordType: "verb",
      }),
      item({
        examples: [
          {
            de: "Ich wohne in Ho-Chi-Minh-Stadt.",
            vi: "Tôi sống ở Thành phố Hồ Chí Minh.",
          },
        ],
        headword: "wohnen",
        meaningsVi: ["sống, cư trú"],
        wordType: "verb",
      }),
      item({
        examples: [
          {
            de: "Ich spreche Vietnamesisch und lerne Deutsch.",
            vi: "Tôi nói tiếng Việt và học tiếng Đức.",
          },
        ],
        headword: "sprechen",
        meaningsVi: ["nói"],
        wordType: "verb",
      }),
      item({
        article: "die",
        examples: [
          {
            de: "Deutsch ist eine neue Sprache für mich.",
            vi: "Tiếng Đức là một ngôn ngữ mới đối với tôi.",
          },
        ],
        headword: "Sprache",
        meaningsVi: ["ngôn ngữ"],
        plural: "die Sprachen",
        wordType: "noun",
      }),
      item({
        examples: [
          {
            de: "Darf ich mich kurz vorstellen?",
            vi: "Tôi có thể tự giới thiệu ngắn gọn không?",
          },
        ],
        grammar: { reflexive: true, separable: true, separablePrefix: "vor" },
        headword: "sich vorstellen",
        meaningsVi: ["tự giới thiệu"],
        wordType: "verb",
      }),
      item({
        examples: [
          {
            de: "Die Mitarbeiterin ist sehr freundlich.",
            vi: "Nữ nhân viên rất thân thiện.",
          },
        ],
        headword: "freundlich",
        meaningsVi: ["thân thiện"],
        wordType: "adjective",
      }),
      item({
        examples: [
          {
            de: "Guten Tag, ich heiße Long.",
            vi: "Xin chào, tôi tên là Long.",
          },
        ],
        headword: "Guten Tag",
        meaningsVi: ["xin chào"],
        wordType: "phrase",
      }),
    ],
  },
  {
    content: { activities: [] },
    estimatedMinutes: 18,
    lessonOrder: 2,
    level: "A1",
    moduleOrder: 1,
    objectiveVi: "Hỏi giờ, đặt lịch và xử lý thay đổi cuộc hẹn cơ bản.",
    published: true,
    slug: "a1-uhrzeit-und-termine",
    titleDe: "Uhrzeit und Termine",
    titleVi: "Giờ giấc và lịch hẹn",
    vocabularySeed: [
      item({
        article: "der",
        examples: [
          {
            de: "Ich habe morgen einen Termin.",
            vi: "Ngày mai tôi có một cuộc hẹn.",
          },
        ],
        headword: "Termin",
        meaningsVi: ["cuộc hẹn"],
        plural: "die Termine",
        wordType: "noun",
      }),
      item({
        article: "die",
        examples: [
          {
            de: "Welche Uhrzeit passt Ihnen?",
            vi: "Giờ nào phù hợp với ông/bà?",
          },
        ],
        headword: "Uhrzeit",
        meaningsVi: ["giờ, thời điểm"],
        plural: "die Uhrzeiten",
        wordType: "noun",
      }),
      item({
        examples: [
          {
            de: "Wir vereinbaren einen Termin für Montag.",
            vi: "Chúng ta hẹn một cuộc hẹn vào thứ Hai.",
          },
        ],
        headword: "vereinbaren",
        meaningsVi: ["thỏa thuận, sắp xếp lịch"],
        wordType: "verb",
      }),
      item({
        examples: [
          { de: "Ich bin immer pünktlich.", vi: "Tôi luôn đúng giờ." },
        ],
        headword: "pünktlich",
        meaningsVi: ["đúng giờ"],
        wordType: "adjective",
      }),
      item({
        article: "die",
        examples: [
          {
            de: "Der Zug hat zehn Minuten Verspätung.",
            vi: "Tàu bị trễ mười phút.",
          },
        ],
        headword: "Verspätung",
        meaningsVi: ["sự chậm trễ"],
        plural: "die Verspätungen",
        wordType: "noun",
      }),
      item({
        article: "der",
        examples: [
          {
            de: "Der Termin steht in meinem Kalender.",
            vi: "Cuộc hẹn có trong lịch của tôi.",
          },
        ],
        headword: "Kalender",
        meaningsVi: ["lịch"],
        plural: "die Kalender",
        wordType: "noun",
      }),
      item({
        examples: [
          { de: "Ich warte auf den Bus.", vi: "Tôi đang chờ xe buýt." },
        ],
        grammar: { governedCase: "Akk", governedPreposition: "auf" },
        headword: "warten",
        meaningsVi: ["chờ"],
        wordType: "verb",
      }),
      item({
        examples: [
          { de: "Ich muss den Termin absagen.", vi: "Tôi phải hủy cuộc hẹn." },
        ],
        grammar: { separable: true, separablePrefix: "ab" },
        headword: "absagen",
        meaningsVi: ["hủy"],
        wordType: "verb",
      }),
      item({
        examples: [
          {
            de: "Können wir das Gespräch verschieben?",
            vi: "Chúng ta có thể dời cuộc nói chuyện không?",
          },
        ],
        headword: "verschieben",
        meaningsVi: ["dời, hoãn"],
        wordType: "verb",
      }),
      item({
        examples: [
          {
            de: "Wie spät ist es? Es ist halb acht.",
            vi: "Mấy giờ rồi? Bảy giờ rưỡi.",
          },
        ],
        headword: "Wie spät ist es?",
        meaningsVi: ["Mấy giờ rồi?"],
        wordType: "phrase",
      }),
    ],
  },
  {
    content: { activities: [] },
    estimatedMinutes: 18,
    lessonOrder: 1,
    level: "A1",
    moduleOrder: 2,
    objectiveVi: "Hỏi giá, mua thực phẩm và thanh toán trong siêu thị.",
    published: true,
    slug: "a1-einkaufen-im-supermarkt",
    titleDe: "Einkaufen im Supermarkt",
    titleVi: "Mua sắm trong siêu thị",
    vocabularySeed: [
      item({
        article: "das",
        examples: [
          {
            de: "Im Supermarkt kaufe ich frische Lebensmittel.",
            vi: "Tôi mua thực phẩm tươi ở siêu thị.",
          },
        ],
        headword: "Lebensmittel",
        meaningsVi: ["thực phẩm"],
        plural: "die Lebensmittel",
        wordType: "noun",
      }),
      item({
        article: "der",
        examples: [
          {
            de: "Der Preis steht auf dem Schild.",
            vi: "Giá được ghi trên bảng.",
          },
        ],
        headword: "Preis",
        meaningsVi: ["giá"],
        plural: "die Preise",
        wordType: "noun",
      }),
      item({
        examples: [
          { de: "Ich kaufe Brot und Milch.", vi: "Tôi mua bánh mì và sữa." },
        ],
        headword: "kaufen",
        meaningsVi: ["mua"],
        wordType: "verb",
      }),
      item({
        examples: [
          {
            de: "Ich brauche noch ein Kilo Äpfel.",
            vi: "Tôi cần thêm một ký táo.",
          },
        ],
        headword: "brauchen",
        meaningsVi: ["cần"],
        wordType: "verb",
      }),
      item({
        examples: [
          {
            de: "Kann ich mit Karte bezahlen?",
            vi: "Tôi có thể trả bằng thẻ không?",
          },
        ],
        headword: "bezahlen",
        meaningsVi: ["thanh toán"],
        wordType: "verb",
      }),
      item({
        examples: [
          { de: "Die Äpfel sind heute günstig.", vi: "Hôm nay táo có giá rẻ." },
        ],
        headword: "günstig",
        meaningsVi: ["giá rẻ, hợp lý"],
        wordType: "adjective",
      }),
      item({
        examples: [
          {
            de: "Der Supermarkt ist bis 20 Uhr geöffnet.",
            vi: "Siêu thị mở cửa đến 20 giờ.",
          },
        ],
        headword: "geöffnet",
        meaningsVi: ["đang mở cửa"],
        wordType: "adjective",
      }),
      item({
        article: "die",
        examples: [
          {
            de: "Könnte ich bitte die Rechnung bekommen?",
            vi: "Cho tôi xin hóa đơn được không?",
          },
        ],
        headword: "Rechnung",
        meaningsVi: ["hóa đơn"],
        plural: "die Rechnungen",
        wordType: "noun",
      }),
      item({
        examples: [
          { de: "Ich hätte gern ein Brot.", vi: "Tôi muốn một ổ bánh mì." },
        ],
        headword: "Ich hätte gern ...",
        meaningsVi: ["Tôi muốn ..."],
        wordType: "phrase",
      }),
      item({
        examples: [
          { de: "Wie viel kostet das?", vi: "Cái này giá bao nhiêu?" },
        ],
        headword: "Wie viel kostet das?",
        meaningsVi: ["Cái này giá bao nhiêu?"],
        wordType: "phrase",
      }),
    ],
  },
  {
    content: { activities: [] },
    estimatedMinutes: 20,
    lessonOrder: 2,
    level: "A1",
    moduleOrder: 2,
    objectiveVi:
      "Nói về nghề nghiệp và chuẩn bị các bước đầu cho một hồ sơ ứng tuyển.",
    published: true,
    slug: "a1-beruf-und-bewerbung",
    titleDe: "Beruf und Bewerbung",
    titleVi: "Nghề nghiệp và ứng tuyển",
    vocabularySeed: [
      item({
        examples: [
          {
            de: "Ich bewerbe mich um eine Ausbildungsstelle.",
            vi: "Tôi ứng tuyển vào một vị trí học nghề.",
          },
        ],
        grammar: {
          governedCase: "Akk",
          governedPreposition: "um",
          reflexive: true,
        },
        headword: "sich bewerben",
        meaningsVi: ["ứng tuyển"],
        wordType: "verb",
      }),
      item({
        article: "die",
        examples: [
          {
            de: "Ich schreibe heute meine Bewerbung.",
            vi: "Hôm nay tôi viết hồ sơ ứng tuyển.",
          },
        ],
        headword: "Bewerbung",
        meaningsVi: ["hồ sơ ứng tuyển"],
        plural: "die Bewerbungen",
        wordType: "noun",
      }),
      item({
        article: "der",
        examples: [
          { de: "Was sind Sie von Beruf?", vi: "Ông/bà làm nghề gì?" },
        ],
        headword: "Beruf",
        meaningsVi: ["nghề nghiệp"],
        plural: "die Berufe",
        wordType: "noun",
      }),
      item({
        article: "die",
        examples: [
          {
            de: "Die Ausbildung dauert drei Jahre.",
            vi: "Chương trình học nghề kéo dài ba năm.",
          },
        ],
        headword: "Ausbildung",
        meaningsVi: ["chương trình đào tạo nghề"],
        plural: "die Ausbildungen",
        wordType: "noun",
      }),
      item({
        examples: [
          {
            de: "Ich arbeite in einem Hotel.",
            vi: "Tôi làm việc trong một khách sạn.",
          },
        ],
        headword: "arbeiten",
        meaningsVi: ["làm việc"],
        wordType: "verb",
      }),
      item({
        article: "die",
        examples: [
          {
            de: "Ich habe Erfahrung im Verkauf.",
            vi: "Tôi có kinh nghiệm bán hàng.",
          },
        ],
        headword: "Erfahrung",
        meaningsVi: ["kinh nghiệm"],
        plural: "die Erfahrungen",
        wordType: "noun",
      }),
      item({
        examples: [
          {
            de: "Er ist zuverlässig und kommt immer pünktlich.",
            vi: "Anh ấy đáng tin cậy và luôn đến đúng giờ.",
          },
        ],
        headword: "zuverlässig",
        meaningsVi: ["đáng tin cậy"],
        wordType: "adjective",
      }),
      item({
        article: "die",
        examples: [
          {
            de: "Ich suche eine Stelle als Verkäufer.",
            vi: "Tôi tìm một vị trí nhân viên bán hàng.",
          },
        ],
        headword: "Stelle",
        meaningsVi: ["vị trí việc làm"],
        plural: "die Stellen",
        wordType: "noun",
      }),
      item({
        article: "das",
        examples: [
          {
            de: "Das Vorstellungsgespräch ist am Dienstag.",
            vi: "Buổi phỏng vấn diễn ra vào thứ Ba.",
          },
        ],
        headword: "Vorstellungsgespräch",
        meaningsVi: ["buổi phỏng vấn"],
        plural: "die Vorstellungsgespräche",
        wordType: "noun",
      }),
      item({
        article: "der",
        examples: [
          {
            de: "Bitte schicken Sie Ihren Lebenslauf per E-Mail.",
            vi: "Vui lòng gửi sơ yếu lý lịch qua email.",
          },
        ],
        headword: "Lebenslauf",
        meaningsVi: ["sơ yếu lý lịch"],
        plural: "die Lebensläufe",
        wordType: "noun",
      }),
    ],
  },
];
