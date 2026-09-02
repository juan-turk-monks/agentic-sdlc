import { expect, test } from "@playwright/test";

test("homepage has a single +1 counter button", async ({ page }) => {
  await page.goto("/");

  const buttons = page.getByTestId("counter-button");
  await expect(buttons).toHaveCount(1);

  const button = buttons.first();
  await expect(button).toHaveText("0");

  await button.click();
  await expect(button).toHaveText("1");

  await button.click();
  await expect(button).toHaveText("2");

  await expect(button).toHaveCSS("background-color", "rgb(31, 136, 61)");
  await expect(button).toHaveCSS("color", "rgb(255, 255, 255)");
});
