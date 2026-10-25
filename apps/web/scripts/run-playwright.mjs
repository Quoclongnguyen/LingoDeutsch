process.env.PLAYWRIGHT_EXTERNAL_SERVER = "1";
process.argv = [
  process.execPath,
  "playwright",
  "test",
  "--reporter=line",
  "--workers=1",
];

await import("../../../node_modules/@playwright/test/cli.js");
