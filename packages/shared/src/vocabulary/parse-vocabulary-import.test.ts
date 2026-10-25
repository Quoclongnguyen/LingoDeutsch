import { describe, expect, it } from "vitest";

import {
  ImportRowLimitError,
  parseVocabularyImport,
} from "./parse-vocabulary-import";

describe("parseVocabularyImport", () => {
  it("parses a pipe-separated noun with bilingual example content", () => {
    const [row] = parseVocabularyImport({
      content:
        "Termin | cuộc hẹn | noun | der | die Termine | A1 | Ich habe einen Termin. | Tôi có một cuộc hẹn.",
      format: "lines",
    });

    expect(row).toMatchObject({
      input: {
        article: "der",
        examples: [
          {
            de: "Ich habe einen Termin.",
            vi: "Tôi có một cuộc hẹn.",
          },
        ],
        headword: "Termin",
        meaningsVi: ["cuộc hẹn"],
        plural: "die Termine",
        wordType: "noun",
      },
      line: 1,
      status: "valid",
    });
  });

  it("reports a row-level error when a noun has no article", () => {
    const [row] = parseVocabularyImport({
      content: "Termin | cuộc hẹn | noun",
      format: "lines",
    });

    expect(row?.status).toBe("invalid");
    expect(row?.errors.join(" ")).toContain("article");
  });

  it("detects normalized duplicates inside one import", () => {
    const rows = parseVocabularyImport({
      content:
        "Übung | bài tập | noun | die\nU\u0308bung | bài luyện tập | noun | die",
      format: "lines",
    });

    expect(rows.map((row) => row.status)).toEqual(["valid", "duplicate"]);
  });

  it("supports quoted commas in UTF-8 CSV", () => {
    const rows = parseVocabularyImport({
      content:
        'headword,meaningVi,wordType,level,exampleDe,exampleVi\nvereinbaren,"sắp xếp, hẹn",verb,A1,"Wir vereinbaren einen Termin.","Chúng tôi hẹn một cuộc gặp."',
      format: "csv",
    });

    expect(rows[0]).toMatchObject({
      input: {
        headword: "vereinbaren",
        meaningsVi: ["sắp xếp, hẹn"],
        wordType: "verb",
      },
      line: 2,
      status: "valid",
    });
  });

  it("refuses more than 200 data rows", () => {
    const content = Array.from(
      { length: 201 },
      (_, index) => `Wort ${index} | nghĩa ${index} | phrase`,
    ).join("\n");

    expect(() => parseVocabularyImport({ content, format: "lines" })).toThrow(
      ImportRowLimitError,
    );
  });
});
