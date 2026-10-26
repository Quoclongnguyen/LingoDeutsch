import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { encode } from "next-auth/jwt";

const testAuthSecret = "lingo-deutsch-playwright-secret-value";

async function authenticate(page: Page) {
  const sessionToken = await encode({
    maxAge: 60 * 60,
    secret: testAuthSecret,
    token: {
      email: "long@example.test",
      name: "Long",
      sub: "000000000000000000000002",
    },
  });

  await page.context().addCookies([
    {
      name: "next-auth.session-token",
      url: "http://127.0.0.1:3100",
      value: sessionToken,
    },
  ]);
}

test("health endpoint reports the application is ready", async ({
  request,
}) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({ status: "ok" });
});

test("sign-in foundation is usable on desktop and mobile", async ({ page }) => {
  await page.goto("/auth/signin");

  await expect(
    page.getByRole("heading", { name: "Tiếp tục học tiếng Đức" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Đăng nhập với GitHub" }),
  ).toBeVisible();
});

test("authenticated learner sees the responsive application shell", async ({
  page,
}, testInfo) => {
  await page.route("**/api/domain/dashboard", async (route) =>
    route.fulfill({
      json: {
        due: { count: 0, words: [] },
        milestone: {
          completedLessons: 0,
          titleDe: "Ankommen und vorstellen",
          titleVi: "Làm quen và giới thiệu",
          totalLessons: 2,
        },
        nextLesson: {
          estimatedMinutes: 15,
          objectiveVi: "Tự giới thiệu lịch sự.",
          slug: "a1-begruessung-und-vorstellung",
          titleDe: "Begrüßung und Vorstellung",
          titleVi: "Chào hỏi và giới thiệu",
        },
        practicalGoal: {
          de: "Einen Termin vereinbaren",
          vi: "Đặt một cuộc hẹn bằng tiếng Đức.",
        },
        recentActivity: [],
        weeklyGoal: { completed: 0, target: 5 },
      },
    }),
  );
  await authenticate(page);
  await page.goto("/today");

  await expect(
    page.getByRole("heading", { name: "Hôm nay", level: 1 }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "Begrüßung und Vorstellung" }),
  ).toBeVisible();

  const navigationName =
    testInfo.project.name === "mobile-chromium"
      ? "Điều hướng di động"
      : "Điều hướng chính";
  await expect(
    page.getByRole("navigation", { name: navigationName }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole("button", { name: "Dùng giao diện sáng" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  const lightAccessibility = await new AxeBuilder({ page }).analyze();
  expect(lightAccessibility.violations).toEqual([]);

  await page.screenshot({
    fullPage: true,
    path: `test-results/dashboard-light-${testInfo.project.name}.png`,
  });

  await page.getByRole("button", { name: "Dùng giao diện tối" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  const darkAccessibility = await new AxeBuilder({ page }).analyze();
  expect(darkAccessibility.violations).toEqual([]);

  await page.screenshot({
    fullPage: true,
    path: `test-results/dashboard-dark-${testInfo.project.name}.png`,
  });
});
