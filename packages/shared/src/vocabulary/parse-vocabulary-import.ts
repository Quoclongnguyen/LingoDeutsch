import {
  createVocabularyInputSchema,
  importPreviewInputSchema,
  type ImportPreviewInput,
  type ValidatedVocabularyInput,
} from "../validation/vocabulary";

export type VocabularyImportRow = {
  errors: string[];
  input?: ValidatedVocabularyInput;
  line: number;
  status: "valid" | "invalid" | "duplicate";
};

export class ImportRowLimitError extends Error {
  constructor() {
    super("Mỗi lần nhập chỉ được chứa tối đa 200 dòng dữ liệu.");
    this.name = "ImportRowLimitError";
  }
}

export class ImportFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportFormatError";
  }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (character === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  if (quoted) {
    throw new ImportFormatError("CSV có dấu ngoặc kép chưa được đóng.");
  }

  values.push(current.trim());
  return values;
}

function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function booleanValue(value: string | undefined): boolean | undefined {
  const normalized = optional(value)?.toLocaleLowerCase("vi");
  if (!normalized) return undefined;
  return ["1", "true", "yes", "ja", "có"].includes(normalized);
}

function rawVocabulary(fields: Record<string, string | undefined>) {
  const exampleDe = optional(fields.exampleDe);
  const exampleVi = optional(fields.exampleVi);

  return {
    article: optional(fields.article),
    examples: exampleDe ? [{ de: exampleDe, vi: exampleVi }] : [],
    headword: optional(fields.headword),
    level: optional(fields.level),
    meaningsVi: optional(fields.meaningVi)
      ?.split(";")
      .map((meaning) => meaning.trim())
      .filter(Boolean),
    noPlural: booleanValue(fields.noPlural),
    plural: optional(fields.plural),
    wordType: optional(fields.wordType),
  };
}

function lineRecords(content: string) {
  return content
    .split(/\r?\n/u)
    .map((line, index) => ({ line: index + 1, value: line.trim() }))
    .filter((entry) => entry.value.length > 0)
    .map((entry) => {
      const values = entry.value.split("|").map((value) => value.trim());
      const [
        headword,
        meaningVi,
        wordType,
        article,
        plural,
        level,
        exampleDe,
        exampleVi,
      ] = values;

      return {
        line: entry.line,
        raw: rawVocabulary({
          article,
          exampleDe,
          exampleVi,
          headword,
          level,
          meaningVi,
          plural,
          wordType,
        }),
      };
    });
}

function csvRecords(content: string) {
  const lines = content
    .split(/\r?\n/u)
    .map((line, index) => ({ line: index + 1, value: line.trim() }))
    .filter((entry) => entry.value.length > 0);
  const headerLine = lines.shift();

  if (!headerLine) {
    throw new ImportFormatError("CSV cần có hàng tiêu đề.");
  }

  const headers = parseCsvLine(headerLine.value).map((header, index) =>
    index === 0 ? header.replace(/^\uFEFF/u, "") : header,
  );
  const requiredHeaders = ["headword", "meaningVi", "wordType"];

  if (requiredHeaders.some((header) => !headers.includes(header))) {
    throw new ImportFormatError(
      "CSV cần các cột headword, meaningVi và wordType.",
    );
  }

  return lines.map((entry) => {
    const values = parseCsvLine(entry.value);
    const fields = Object.fromEntries(
      headers.map((header, index) => [header, values[index]]),
    );
    return { line: entry.line, raw: rawVocabulary(fields) };
  });
}

export function parseVocabularyImport(
  input: ImportPreviewInput,
): VocabularyImportRow[] {
  const validatedRequest = importPreviewInputSchema.parse(input);
  const records =
    validatedRequest.format === "csv"
      ? csvRecords(validatedRequest.content)
      : lineRecords(validatedRequest.content);

  if (records.length > 200) {
    throw new ImportRowLimitError();
  }

  const seen = new Set<string>();

  return records.map(({ line, raw }) => {
    const result = createVocabularyInputSchema.safeParse(raw);

    if (!result.success) {
      return {
        errors: result.error.issues.map(
          (issue) => `${issue.path.join(".") || "row"}: ${issue.message}`,
        ),
        line,
        status: "invalid" as const,
      };
    }

    if (seen.has(result.data.normalizedHeadword)) {
      return {
        errors: ["headword: Từ này bị lặp trong dữ liệu nhập."],
        input: result.data,
        line,
        status: "duplicate" as const,
      };
    }

    seen.add(result.data.normalizedHeadword);
    return {
      errors: [],
      input: result.data,
      line,
      status: "valid" as const,
    };
  });
}
