import { expect, test } from "@playwright/test";

test("homepage has the Agentic SLDC document title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Agentic SLDC");
});
