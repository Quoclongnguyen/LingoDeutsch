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

test("learner completes a due review with keyboard controls", async ({
  page,
}) => {
  const active = {
    currentCard: {
      intervalPreviews: {
        again: { dueAt: "2026-10-26T12:10:00.000Z", intervalDays: 0 },
        hard: { dueAt: "2026-10-27T12:00:00.000Z", intervalDays: 1 },
        good: { dueAt: "2026-10-29T12:00:00.000Z", intervalDays: 3 },
        easy: { dueAt: "2026-11-02T12:00:00.000Z", intervalDays: 7 },
      },
      reviewState: {
        dueAt: "2026-10-26T12:00:00.000Z",
        easeFactor: 2.5,
        intervalDays: 0,
        lapseCount: 0,
        repetitions: 0,
        state: "new",
      },
      word: {
        article: "der",
        examples: [
          {
            de: "Ich habe morgen einen Termin.",
            vi: "Ngày mai tôi có một cuộc hẹn.",
          },
        ],
        grammar: {},
        headword: "Termin",
        id: "000000000000000000000010",
        meaningsVi: ["cuộc hẹn"],
        noPlural: false,
        plural: "die Termine",
        wordType: "noun",
      },
    },
    currentIndex: 0,
    id: "000000000000000000000020",
    mode: "de-vi",
    resumed: false,
    reviewedCount: 0,
    status: "active",
    total: 1,
    wordIds: ["000000000000000000000010"],
  };

  await page.route("**/api/domain/review-sessions**", async (route) => {
    if (route.request().url().endsWith("/rate")) {
      return route.fulfill({
        json: {
          idempotent: false,
          nextState: active.currentCard.intervalPreviews.good,
          session: {
            ...active,
            currentCard: undefined,
            currentIndex: 1,
            reviewedCount: 1,
            status: "completed",
            summary: {
              difficultCount: 0,
              nextDueAt: "2026-10-29T12:00:00.000Z",
              reviewedCount: 1,
            },
          },
        },
      });
    }
    return route.fulfill({ json: active, status: 201 });
  });

  await authenticate(page);
  await page.goto("/practice/review");
  await expect(page.getByRole("heading", { name: "Termin" })).toBeVisible();
  await expect(page.getByText("cuộc hẹn", { exact: true })).toBeHidden();

  await page.keyboard.press("Space");
  await expect(page.getByText("cuộc hẹn", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Dùng giao diện sáng" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Dùng giao diện tối" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.keyboard.press("3");
  await expect(
    page.getByRole("heading", { name: "Phiên ôn đã hoàn thành" }),
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
