import {
  vocabularySeedItemSchema,
  type LessonActivity as SharedLessonActivity,
  type VocabularySeedItem,
} from "@lingo-deutsch/shared";

export type LessonActivity = SharedLessonActivity;

export type LessonSeed = {
  content: { activities: LessonActivity[] };
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
    content: {
      activities: [
        {
          id: "dialogue-introduction",
          instructionVi:
            "Đọc đoạn hội thoại và chú ý cách xưng hô lịch sự bằng Sie.",
          lines: [
            {
              de: "Guten Tag. Ich heiße Anna Keller. Wie heißen Sie?",
              speaker: "Anna",
              vi: "Xin chào. Tôi tên là Anna Keller. Ông/bà tên là gì?",
            },
            {
              de: "Guten Tag. Ich heiße Long Nguyen. Ich komme aus Vietnam.",
              speaker: "Long",
              vi: "Xin chào. Tôi tên là Long Nguyen. Tôi đến từ Việt Nam.",
            },
            {
              de: "Freut mich. Welche Sprachen sprechen Sie?",
              speaker: "Anna",
              vi: "Rất vui được gặp ông/bà. Ông/bà nói những ngôn ngữ nào?",
            },
          ],
          titleDe: "Begrüßung im Sprachkurs",
          type: "dialogue",
        },
        {
          headwords: ["Name", "heißen", "kommen", "sich vorstellen"],
          id: "vocabulary-introduction",
          instructionVi:
            "Chọn những từ bạn muốn đưa vào kho để ôn lại sau bài học.",
          type: "vocabulary",
        },
        {
          exercises: [
            {
              correctOptionId: "formal-introduction",
              feedbackCorrectVi:
                "Đúng: Guten Tag và Sie phù hợp với lần gặp trang trọng.",
              feedbackIncorrectVi:
                "Trong lần gặp trang trọng, hãy dùng Guten Tag và đại từ Sie.",
              id: "formal-introduction",
              instructionVi:
                "Chọn câu giới thiệu phù hợp trong lần gặp đầu tiên.",
              options: [
                {
                  id: "formal-introduction",
                  text: "Guten Tag. Ich heiße Long. Wie heißen Sie?",
                },
                { id: "informal-command", text: "Hallo! Sag deinen Namen!" },
                { id: "farewell", text: "Auf Wiedersehen. Bis morgen." },
              ],
              promptDe: "Wie stellen Sie sich höflich vor?",
              type: "multiple_choice",
            },
          ],
          id: "practice-introduction",
          instructionVi: "Áp dụng cách xưng hô trang trọng.",
          type: "exercise_set",
        },
      ],
    },
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
    content: {
      activities: [
        {
          id: "dialogue-appointment",
          instructionVi: "Đọc cách đề nghị và xác nhận một giờ hẹn.",
          lines: [
            {
              de: "Passt Ihnen Montag um zehn Uhr?",
              speaker: "Anna",
              vi: "Thứ Hai lúc mười giờ có phù hợp với ông/bà không?",
            },
            {
              de: "Ja, der Termin passt mir gut.",
              speaker: "Long",
              vi: "Vâng, giờ hẹn đó phù hợp với tôi.",
            },
          ],
          titleDe: "Einen Termin vereinbaren",
          type: "dialogue",
        },
        {
          headwords: ["Termin", "Uhrzeit", "vereinbaren", "pünktlich"],
          id: "vocabulary-appointment",
          instructionVi: "Lưu các từ cần thiết để đặt lịch và đến đúng giờ.",
          type: "vocabulary",
        },
        {
          exercises: [
            {
              correctOptionId: "um-zehn",
              feedbackCorrectVi: "Đúng: um đi trước giờ cụ thể.",
              feedbackIncorrectVi: "Với giờ cụ thể, tiếng Đức dùng giới từ um.",
              id: "appointment-preposition",
              instructionVi: "Chọn cụm thời gian đúng.",
              options: [
                { id: "um-zehn", text: "um zehn Uhr" },
                { id: "am-zehn", text: "am zehn Uhr" },
                { id: "im-zehn", text: "im zehn Uhr" },
              ],
              promptDe: "Der Termin ist ___?",
              type: "multiple_choice",
            },
            {
              acceptedAnswers: ["pünktlich"],
              caseSensitive: false,
              feedbackCorrectVi: "Đúng: pünktlich nghĩa là đúng giờ.",
              feedbackIncorrectVi: "Giữ nguyên umlaut trong từ pünktlich.",
              id: "appointment-punctual",
              instructionVi: "Điền tính từ phù hợp.",
              promptDe: "Ich bin immer ___.",
              type: "fill_blank",
            },
            {
              correctOrder: ["wir", "vereinbaren", "einen", "termin"],
              feedbackCorrectVi: "Đúng: động từ đứng ở vị trí thứ hai.",
              feedbackIncorrectVi: "Trong câu trần thuật, vereinbaren đứng sau chủ ngữ.",
              id: "appointment-order",
              instructionVi: "Sắp xếp thành một câu hoàn chỉnh.",
              tokens: [
                { id: "einen", text: "einen" },
                { id: "termin", text: "Termin." },
                { id: "wir", text: "Wir" },
                { id: "vereinbaren", text: "vereinbaren" },
              ],
              type: "word_ordering",
            },
          ],
          id: "practice-appointment",
          instructionVi: "Luyện đặt lịch bằng ba dạng bài ngắn.",
          type: "exercise_set",
        },
      ],
    },
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
    content: {
      activities: [
        {
          id: "dialogue-supermarket",
          instructionVi: "Đọc đoạn hội thoại ngắn tại quầy thanh toán.",
          lines: [
            {
              de: "Wie viel kostet das Brot?",
              speaker: "Long",
              vi: "Ổ bánh mì này giá bao nhiêu?",
            },
            {
              de: "Das Brot kostet zwei Euro.",
              speaker: "Verkäuferin",
              vi: "Ổ bánh mì giá hai euro.",
            },
          ],
          titleDe: "An der Kasse",
          type: "dialogue",
        },
        {
          headwords: ["Lebensmittel", "Preis", "kaufen", "bezahlen"],
          id: "vocabulary-supermarket",
          instructionVi: "Lưu các từ cần dùng khi mua sắm.",
          type: "vocabulary",
        },
        {
          exercises: [
            {
              correctOptionId: "mit-karte",
              feedbackCorrectVi: "Đúng: mit Karte bezahlen là thanh toán bằng thẻ.",
              feedbackIncorrectVi: "Để hỏi cách thanh toán, dùng mit Karte bezahlen.",
              id: "supermarket-payment",
              instructionVi: "Chọn câu hỏi phù hợp tại quầy thanh toán.",
              options: [
                { id: "mit-karte", text: "Kann ich mit Karte bezahlen?" },
                { id: "appointment", text: "Passt Ihnen Montag?" },
                { id: "introduction", text: "Wie heißen Sie?" },
              ],
              promptDe: "Sie möchten mit Karte bezahlen.",
              type: "multiple_choice",
            },
            {
              acceptedAnswers: ["kostet"],
              caseSensitive: false,
              feedbackCorrectVi: "Đúng: das đi với kostet.",
              feedbackIncorrectVi: "Với chủ ngữ das, kosten được chia thành kostet.",
              id: "supermarket-cost",
              instructionVi: "Điền dạng động từ đúng.",
              promptDe: "Wie viel ___ das?",
              type: "fill_blank",
            },
            {
              correctOrder: ["ich", "haette", "gern", "ein", "brot"],
              feedbackCorrectVi: "Đúng: Ich hätte gern… là cách yêu cầu lịch sự.",
              feedbackIncorrectVi: "Bắt đầu bằng Ich hätte gern, sau đó là món cần mua.",
              id: "supermarket-order",
              instructionVi: "Sắp xếp thành một yêu cầu lịch sự.",
              tokens: [
                { id: "brot", text: "Brot." },
                { id: "gern", text: "gern" },
                { id: "ich", text: "Ich" },
                { id: "ein", text: "ein" },
                { id: "haette", text: "hätte" },
              ],
              type: "word_ordering",
            },
          ],
          id: "practice-supermarket",
          instructionVi: "Luyện hỏi giá và thanh toán.",
          type: "exercise_set",
        },
      ],
    },
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
    content: {
      activities: [
        {
          id: "dialogue-occupation",
          instructionVi: "Đọc cách nói ngắn gọn về nghề nghiệp và mục tiêu.",
          lines: [
            {
              de: "Was sind Sie von Beruf?",
              speaker: "Frau Keller",
              vi: "Ông/bà làm nghề gì?",
            },
            {
              de: "Ich arbeite im Verkauf und bewerbe mich um eine Ausbildungsstelle.",
              speaker: "Long",
              vi: "Tôi làm trong ngành bán hàng và ứng tuyển một vị trí học nghề.",
            },
          ],
          titleDe: "Über den Beruf sprechen",
          type: "dialogue",
        },
        {
          headwords: ["sich bewerben", "Bewerbung", "Beruf", "Ausbildung"],
          id: "vocabulary-occupation",
          instructionVi: "Lưu các từ nền tảng về nghề nghiệp và ứng tuyển.",
          type: "vocabulary",
        },
        {
          exercises: [
            {
              correctOptionId: "um-stelle",
              feedbackCorrectVi: "Đúng: sich bewerben um đi với Akkusativ.",
              feedbackIncorrectVi: "Động từ sich bewerben dùng giới từ um + Akkusativ.",
              id: "occupation-preposition",
              instructionVi: "Chọn cụm đúng.",
              options: [
                { id: "um-stelle", text: "um eine Stelle" },
                { id: "mit-stelle", text: "mit eine Stelle" },
                { id: "bei-stelle", text: "bei eine Stelle" },
              ],
              promptDe: "Ich bewerbe mich ___?",
              type: "multiple_choice",
            },
            {
              acceptedAnswers: ["arbeite"],
              caseSensitive: false,
              feedbackCorrectVi: "Đúng: với ich, arbeiten được chia thành arbeite.",
              feedbackIncorrectVi: "Với chủ ngữ ich, thêm đuôi -e: arbeite.",
              id: "occupation-verb",
              instructionVi: "Điền dạng động từ đúng.",
              promptDe: "Ich ___ in einem Hotel.",
              type: "fill_blank",
            },
            {
              correctOrder: ["ich", "bewerbe", "mich", "um", "eine", "stelle"],
              feedbackCorrectVi: "Đúng: đại từ phản thân mich đứng sau động từ.",
              feedbackIncorrectVi: "Dùng cấu trúc Ich bewerbe mich um eine Stelle.",
              id: "occupation-order",
              instructionVi: "Sắp xếp câu ứng tuyển.",
              tokens: [
                { id: "stelle", text: "Stelle." },
                { id: "mich", text: "mich" },
                { id: "ich", text: "Ich" },
                { id: "eine", text: "eine" },
                { id: "um", text: "um" },
                { id: "bewerbe", text: "bewerbe" },
              ],
              type: "word_ordering",
            },
          ],
          id: "practice-occupation",
          instructionVi: "Luyện nói về công việc và ứng tuyển.",
          type: "exercise_set",
        },
      ],
    },
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
