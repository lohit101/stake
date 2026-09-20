import { test, expect, type Page } from "@playwright/test";
async function placeBet(page: Page, half: "left" | "right") {
  const button = page.getByRole("button", { name: "Bet", exact: true });
  await expect(button).toBeEnabled();
  const box = await button.boundingBox();
  if (!box) throw new Error("Bet button is not visible");
  const options = {
    position: {
      x: box.width * (half === "left" ? 0.25 : 0.75),
      y: box.height / 2,
    },
  };
  if (test.info().project.name === "mobile") await button.tap(options);
  else await button.click(options);
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    crypto.getRandomValues = function <T extends ArrayBufferView | null>(
      array: T,
    ): T {
      if (array instanceof Uint32Array) array.fill(0);
      return array;
    };
  });
});
test("lobby, covers, search and mobile overflow", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Casino", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".game-cover")).toHaveCount(6);
  await expect(page.locator("a.game-cover")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Search games" }).fill("mines");
  await expect(page.locator(".game-cover")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Search games" }).fill("missing");
  await expect(page.getByText("No games found.")).toBeVisible();
  await page.getByRole("textbox", { name: "Search games" }).fill("");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/lobby-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("safe tile, cashout, persistence and mine loss", async ({ page }) => {
  await page.goto("/casino/games/mines");
  await placeBet(page, "right");
  await expect(page.getByTestId("balance")).toContainText("990.00");
  await page.getByRole("button", { name: "Tile 4", exact: true }).click();
  await page.getByRole("button", { name: /Cash Out/ }).click();
  await expect(page.getByRole("status")).toContainText("Cashed out $11.25");
  await expect(page.getByTestId("balance")).toContainText("1,001.25");
  await page.reload();
  await expect(page.getByTestId("balance")).toContainText("1,001.25");
  await placeBet(page, "left");
  await page.getByRole("button", { name: "Tile 1", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Tile 2", exact: true }).click();
  await expect(page.getByRole("status")).not.toContainText("You hit a mine");
  await page.getByRole("button", { name: "Tile 3", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("You hit a mine");
  await expect(page.getByTestId("balance")).toContainText("991.25");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/mines-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("validation, immediate cashout, last safe tile and restored active round", async ({
  page,
}) => {
  await page.goto("/casino/games/mines");
  await page.getByLabel("Bet Amount").fill("-1");
  await placeBet(page, "right");
  await expect(page.locator(".error[role=alert]")).toContainText("at least");
  await page.getByLabel("Bet Amount").fill("1001");
  await placeBet(page, "right");
  await expect(page.locator(".error[role=alert]")).toContainText("Not enough");
  await page.getByLabel("Bet Amount").fill("10");
  await page.getByLabel("Grid Size").selectOption("3");
  await page.getByLabel("Mines", { exact: true }).selectOption("8");
  await placeBet(page, "right");
  await page.reload();
  await expect(page.getByLabel("Grid Size")).toBeDisabled();
  await page.getByRole("button", { name: /Cash Out/ }).click();
  await expect(page.getByTestId("balance")).toContainText("1,000.00");
  await page.getByLabel("Grid Size").selectOption("3");
  await page.getByLabel("Mines", { exact: true }).selectOption("8");
  await placeBet(page, "right");
  await page.getByRole("button", { name: "Tile 1", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Cashed out $89.10");
  await expect(page.getByTestId("balance")).toContainText("1,079.10");
});

test("always-win round safely reveals every gem and removes demo labels", async ({
  page,
}) => {
  await page.goto("/casino/games/mines");
  await expect(page.locator("body")).not.toContainText(/demo/i);
  await page.getByLabel("Grid Size").selectOption("3");
  await placeBet(page, "right");
  for (let i = 1; i <= 6; i++)
    await page.getByRole("button", { name: `Tile ${i}`, exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Cashed out");
  await expect(page.locator(".exploded")).toHaveCount(0);
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.goto("/");
  await expect(page.locator("body")).not.toContainText(/demo/i);
});

test("single Bet button supports keyboard activation", async ({ page }) => {
  await page.goto("/casino/games/mines");
  const button = page.getByRole("button", { name: "Bet", exact: true });
  await expect(button).toHaveCount(1);
  await expect(button).toBeEnabled();
  await button.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Tile 1", exact: true }).click();
  await page.getByRole("button", { name: /Cash Out/ }).click();
  await expect(page.getByRole("status")).toContainText("Cashed out $11.25");
});
