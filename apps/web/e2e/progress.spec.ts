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

test("progress presents exact evidence without mobile overflow", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ height: 812, width: 375 });
  }
  await page.route("**/api/domain/progress", async (route) =>
    route.fulfill({
      json: {
        activity: {
          activeDays: 2,
          days: [
            {
              date: "2026-10-21",
              exerciseAttempts: 0,
              lessonUpdates: 0,
              reviews: 0,
            },
            {
              date: "2026-10-22",
              exerciseAttempts: 0,
              lessonUpdates: 0,
              reviews: 0,
            },
            {
              date: "2026-10-23",
              exerciseAttempts: 0,
              lessonUpdates: 0,
              reviews: 0,
            },
            {
              date: "2026-10-24",
              exerciseAttempts: 0,
              lessonUpdates: 0,
              reviews: 0,
            },
            {
              date: "2026-10-25",
              exerciseAttempts: 0,
              lessonUpdates: 1,
              reviews: 3,
            },
            {
              date: "2026-10-26",
              exerciseAttempts: 1,
              lessonUpdates: 0,
              reviews: 0,
            },
            {
              date: "2026-10-27",
              exerciseAttempts: 0,
              lessonUpdates: 0,
              reviews: 0,
            },
          ],
        },
        completedOutcomes: [
          {
            objectiveVi: "Tự giới thiệu lịch sự.",
            slug: "a1-begruessung-und-vorstellung",
            titleDe: "Begrüßung und Vorstellung",
            titleVi: "Chào hỏi và giới thiệu",
          },
        ],
        generatedAt: "2026-10-27T09:00:00.000Z",
        learning: {
          completedLessons: 1,
          inProgressLessons: 1,
          modules: [
            {
              completedLessons: 1,
              moduleOrder: 1,
              titleDe: "Ankommen und vorstellen",
              titleVi: "Làm quen và giới thiệu",
              totalLessons: 2,
            },
          ],
          nextLesson: {
            slug: "a1-uhrzeit-und-termine",
            titleDe: "Uhrzeit und Termine",
            titleVi: "Giờ giấc và lịch hẹn",
          },
          totalLessons: 4,
        },
        practice: {
          attempts: 1,
          correctAnswers: 2,
          recent: [
            {
              completedAt: "2026-10-26T08:00:00.000Z",
              score: 2,
              sourceTitleDe: "Uhrzeit und Termine",
              sourceType: "lesson",
              total: 3,
            },
          ],
          totalAnswers: 3,
        },
        reviews: { difficultReviews: 1, totalReviews: 3 },
        vocabulary: {
          dueWords: 2,
          masteredWords: 0,
          reviewedWords: 3,
          totalWords: 10,
        },
      },
    }),
  );
  await authenticate(page);
  await page.goto("/progress");

  await expect(
    page.getByRole("heading", { level: 1, name: "Tiến độ" }),
  ).toBeVisible();
  await expect(page.getByText("1/4 bài A1")).toBeVisible();
  await expect(page.getByText("3 từ đã ôn")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});
