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

test("learner can add and search the responsive vocabulary library", async ({
  page,
}) => {
  const words = [
    {
      article: "der",
      examples: [],
      grammar: {},
      headword: "Termin",
      id: "000000000000000000000010",
      level: "A1",
      meaningsVi: ["lịch hẹn"],
      noPlural: false,
      plural: "Termine",
      review: { dueAt: new Date().toISOString(), state: "learning" },
      setIds: [],
      updatedAt: new Date().toISOString(),
      wordType: "noun",
    },
  ];

  await page.route("**/api/domain/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith("/vocabulary-sets"))
      return route.fulfill({ json: { items: [] } });
    if (url.pathname.endsWith("/vocabulary") && request.method() === "POST") {
      const input = request.postDataJSON();
      words.push({
        ...input,
        id: "000000000000000000000011",
        review: { dueAt: new Date().toISOString(), state: "new" },
        setIds: input.setIds ?? [],
        updatedAt: new Date().toISOString(),
      });
      return route.fulfill({
        json: { word: { id: words.at(-1)?.id } },
        status: 201,
      });
    }
    if (url.pathname.endsWith("/vocabulary")) {
      const query = url.searchParams.get("q")?.toLocaleLowerCase("de") ?? "";
      const items = words.filter(
        (word) =>
          !query ||
          word.headword.toLocaleLowerCase("de").includes(query) ||
          word.meaningsVi.some((meaning: string) =>
            meaning.toLocaleLowerCase("vi").includes(query),
          ),
      );
      return route.fulfill({
        json: {
          items,
          pagination: {
            page: 1,
            pageSize: 20,
            total: items.length,
            totalPages: 1,
          },
          summary: {
            due: words.length,
            learning: 1,
            mastered: 0,
            total: words.length,
          },
        },
      });
    }
    return route.fulfill({ json: { error: "not_found" }, status: 404 });
  });

  await authenticate(page);
  await page.goto("/vocabulary");
  await expect(page.getByRole("heading", { name: "Termin" })).toBeVisible();

  await page.getByRole("button", { name: "Thêm từ" }).click();
  await page.getByLabel("Từ tiếng Đức").fill("Arbeit");
  await page.getByLabel("Nghĩa tiếng Việt").fill("công việc");
  await page.getByLabel("Mạo từ").selectOption("die");
  await page
    .getByRole("textbox", { name: "Số nhiều", exact: true })
    .fill("Arbeiten");
  await page.getByRole("button", { name: "Lưu từ" }).click();
  await expect(page.getByRole("heading", { name: "Arbeit" })).toBeVisible();

  await page.getByRole("searchbox", { name: "Tìm từ vựng" }).fill("Arbeit");
  await page.getByRole("button", { name: "Tìm kiếm" }).click();
  await expect(page.getByRole("heading", { name: "Termin" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Arbeit" })).toBeVisible();

  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
