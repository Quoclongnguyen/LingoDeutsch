import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { encode } from "next-auth/jwt";

const testAuthSecret = "lingo-deutsch-playwright-secret-value";

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

test("learner follows the A1 path, saves a word, and completes a lesson", async ({
  page,
}) => {
  const lesson = {
    content: {
      activities: [
        {
          id: "dialogue-introduction",
          instructionVi: "Đọc đoạn hội thoại.",
          lines: [
            {
              de: "Guten Tag. Ich heiße Long.",
              speaker: "Long",
              vi: "Xin chào. Tôi tên là Long.",
            },
          ],
          titleDe: "Begrüßung im Sprachkurs",
          type: "dialogue",
        },
        {
          headwords: ["Name"],
          id: "vocabulary-introduction",
          instructionVi: "Lưu từ để ôn tập.",
          type: "vocabulary",
        },
        {
          correctOptionId: "formal-introduction",
          feedbackVi: "Đúng. Đây là cách giới thiệu lịch sự.",
          id: "check-introduction",
          instructionVi: "Chọn câu phù hợp.",
          options: [
            {
              id: "formal-introduction",
              text: "Guten Tag. Ich heiße Long. Wie heißen Sie?",
            },
            { id: "farewell", text: "Auf Wiedersehen." },
          ],
          questionDe: "Wie stellen Sie sich höflich vor?",
          type: "check",
        },
      ],
    },
    estimatedMinutes: 15,
    id: "000000000000000000000101",
    level: "A1",
    objectiveVi: "Tự giới thiệu lịch sự.",
    progress: {
      completedActivityIds: [] as string[],
      currentActivityIndex: 0,
      status: "not_started",
    },
    slug: "a1-begruessung-und-vorstellung",
    titleDe: "Begrüßung und Vorstellung",
    titleVi: "Chào hỏi và giới thiệu",
    vocabulary: [
      {
        article: "der",
        examples: [{ de: "Mein Name ist Long.", vi: "Tên tôi là Long." }],
        headword: "Name",
        isSaved: false,
        meaningsVi: ["tên"],
        noPlural: false,
        plural: "die Namen",
        wordType: "noun",
      },
    ],
  };

  await page.route("**/api/domain/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith("/learning-path")) {
      return route.fulfill({
        json: {
          level: "A1",
          modules: [
            {
              completedLessons: 0,
              descriptionVi: "Ngôn ngữ nền tảng.",
              dueCount: 0,
              estimatedMinutes: 33,
              lessons: [
                {
                  dueCount: 0,
                  estimatedMinutes: 15,
                  id: lesson.id,
                  isLocked: false,
                  isNext: true,
                  lessonOrder: 1,
                  moduleOrder: 1,
                  objectiveVi: lesson.objectiveVi,
                  progress: lesson.progress,
                  slug: lesson.slug,
                  titleDe: lesson.titleDe,
                  titleVi: lesson.titleVi,
                  vocabularyCount: 10,
                },
              ],
              moduleOrder: 1,
              outcomeVi: "Tự giới thiệu lịch sự.",
              progressPercent: 0,
              titleDe: "Ankommen und vorstellen",
              titleVi: "Làm quen và giới thiệu",
              totalLessons: 1,
              vocabularyCount: 10,
            },
          ],
          nextLesson: { slug: lesson.slug },
        },
      });
    }
    if (url.pathname.endsWith(`/lessons/${lesson.slug}`)) {
      return route.fulfill({ json: lesson });
    }
    if (url.pathname.endsWith(`/lessons/${lesson.id}/vocabulary`)) {
      lesson.vocabulary[0]!.isSaved = true;
      return route.fulfill({
        json: { status: "created", word: { headword: "Name", id: "word" } },
      });
    }
    if (url.pathname.endsWith(`/lesson-progress/${lesson.id}`)) {
      lesson.progress = request.postDataJSON();
      return route.fulfill({ json: lesson.progress });
    }
    return route.fulfill({ json: { error: "not_found" }, status: 404 });
  });

  await authenticate(page);
  await page.goto("/learn");
  await expect(
    page.getByRole("heading", { name: "Ankommen und vorstellen" }),
  ).toBeVisible({ timeout: 15_000 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("link", { name: /Bắt đầu bài tiếp theo/i }).click();
  await expect(
    page.getByRole("heading", { name: "Begrüßung im Sprachkurs" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hoàn thành hoạt động" }).click();
  await expect(page.getByText("der Name · die Namen")).toBeVisible();
  await page.getByRole("button", { name: "Lưu vào kho từ" }).click();
  await expect(page.getByText("Đã lưu vào kho từ")).toBeVisible();
  await page.getByRole("button", { name: "Hoàn thành hoạt động" }).click();
  await page
    .getByRole("button", {
      name: /Guten Tag. Ich heiße Long. Wie heißen Sie?/i,
    })
    .click();
  await page.getByRole("button", { name: "Hoàn thành bài học" }).click();
  await expect(
    page.getByRole("heading", { name: "Bạn đã hoàn thành bài học" }),
  ).toBeVisible();

  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
