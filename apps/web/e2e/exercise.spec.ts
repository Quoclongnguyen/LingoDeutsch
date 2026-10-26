import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { encode } from "next-auth/jwt";

const testAuthSecret = "lingo-deutsch-playwright-secret-value";
const sourceId = "000000000000000000000301";
const exercises = [
  {
    feedbackCorrectVi: "Đúng: Sie là cách xưng hô trang trọng.",
    feedbackIncorrectVi: "Hãy dùng Sie khi nói chuyện trang trọng.",
    id: "formal-address",
    instructionVi: "Chọn đại từ phù hợp.",
    options: [
      { id: "du", text: "du" },
      { id: "sie", text: "Sie" },
    ],
    promptDe: "Wie heißen ___?",
    type: "multiple_choice",
  },
  {
    feedbackCorrectVi: "Đúng: heißen giữ nguyên ß.",
    feedbackIncorrectVi: "Giữ nguyên chữ ß trong heißen.",
    id: "fill-heissen",
    instructionVi: "Điền động từ.",
    promptDe: "Wie ___ Sie?",
    type: "fill_blank",
  },
  {
    feedbackCorrectVi: "Đúng trật tự câu hỏi.",
    feedbackIncorrectVi: "Wie đứng đầu, sau đó là động từ.",
    id: "order-question",
    instructionVi: "Sắp xếp câu hỏi.",
    tokens: [
      { id: "sie-token", text: "Sie?" },
      { id: "wie", text: "Wie" },
      { id: "heissen-token", text: "heißen" },
    ],
    type: "word_ordering",
  },
] as const;

async function authenticate(page: Page) {
  const sessionToken = await encode({
    maxAge: 60 * 60,
    secret: testAuthSecret,
    token: { name: "Long", sub: "000000000000000000000002" },
  });
  await page.context().addCookies([
    {
      name: "next-auth.session-token",
      url: "http://127.0.0.1:3100",
      value: sessionToken,
    },
  ]);
}

test("learner completes all exercise types and retries with a new attempt", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ height: 812, width: 375 });
  }
  const submissions: Array<Record<string, unknown>> = [];
  await page.route("**/api/domain/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith("/grammar-topics/a1-exercises")) {
      return route.fulfill({
        json: {
          examples: [
            { de: "Wie heißen Sie?", vi: "Ông/bà tên là gì?" },
            { de: "Ich heiße Long.", vi: "Tôi tên là Long." },
          ],
          exercises,
          id: sourceId,
          level: "A1",
          order: 1,
          relatedLessons: [],
          rules: [
            {
              explanationVi: "Dùng Sie trong tình huống trang trọng.",
              id: "formal-register",
              titleDe: "Sie",
            },
          ],
          slug: "a1-exercises",
          summaryVi: "Luyện xưng hô và trật tự câu hỏi.",
          titleDe: "Anrede und Wortstellung",
          titleVi: "Xưng hô và trật tự từ",
        },
      });
    }
    if (url.pathname.endsWith("/exercise-attempts")) {
      const payload = request.postDataJSON() as {
        answers: Array<{ answer: string | string[]; exerciseId: string }>;
      } & Record<string, unknown>;
      submissions.push(payload);
      const correctById = new Map<string, string | string[]>([
        ["formal-address", "sie"],
        ["fill-heissen", "heißen"],
        ["order-question", ["wie", "heissen-token", "sie-token"]],
      ]);
      const results = payload.answers.map((answer) => {
        const expected = correctById.get(answer.exerciseId);
        const correct = Array.isArray(expected)
          ? JSON.stringify(answer.answer) === JSON.stringify(expected)
          : answer.answer === expected;
        const exercise = exercises.find(
          (item) => item.id === answer.exerciseId,
        )!;
        return {
          correct,
          exerciseId: answer.exerciseId,
          feedbackVi: correct
            ? exercise.feedbackCorrectVi
            : exercise.feedbackIncorrectVi,
          type: exercise.type,
        };
      });
      const score = results.filter((result) => result.correct).length;
      return route.fulfill({
        json: {
          attempt: { score, total: exercises.length },
          idempotent: false,
          results,
        },
      });
    }
    return route.fulfill({ json: { error: "not_found" }, status: 404 });
  });

  await authenticate(page);
  await page.goto("/practice/exercises/grammar_topic/a1-exercises");
  await expect(
    page.getByRole("heading", {
      name: "Luyện ngữ pháp: Anrede und Wortstellung",
    }),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Sie" }).click();
  await page.getByRole("button", { name: "Câu tiếp theo" }).click();
  await page.getByRole("textbox", { name: "Câu trả lời" }).fill("heißen");
  await page.getByRole("button", { name: "Câu tiếp theo" }).click();
  await page.getByRole("button", { name: "Thêm Wie" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Thêm heißen" }).click();
  await page.getByRole("button", { name: "Thêm Sie" }).click();
  await expect(
    page.getByRole("status", { name: "Thứ tự hiện tại" }),
  ).toContainText("Wie heißen Sie?");
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(
    page.getByRole("heading", { name: "Kết quả 3/3" }),
  ).toBeVisible();
  await expect(page.getByText("Đúng trật tự câu hỏi.")).toBeVisible();

  await page.getByRole("button", { name: "Làm lại" }).click();
  await page.getByRole("button", { name: "du" }).click();
  await page.getByRole("button", { name: "Câu tiếp theo" }).click();
  await page.getByRole("textbox", { name: "Câu trả lời" }).fill("heissen");
  await page.getByRole("button", { name: "Câu tiếp theo" }).click();
  await page.getByRole("button", { name: "Thêm Wie" }).click();
  await page.getByRole("button", { name: "Thêm heißen" }).click();
  await page.getByRole("button", { name: "Thêm Sie" }).click();
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(
    page.getByRole("heading", { name: "Kết quả 1/3" }),
  ).toBeVisible();

  expect(submissions).toHaveLength(2);
  expect(submissions[0]).not.toHaveProperty("userId");
  expect(submissions[0]?.attemptEventId).not.toBe(
    submissions[1]?.attemptEventId,
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);

  await page.getByRole("button", { name: "Dùng giao diện sáng" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Dùng giao diện tối" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
