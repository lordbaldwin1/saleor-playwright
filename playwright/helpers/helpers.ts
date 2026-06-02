import { Page } from "@playwright/test";


export async function isMobile(page: Page) {
  const viewport = page.viewportSize();
  if (!viewport) {
    throw new Error("Unable to get viewport size");
  }
  return viewport.width < 768;
}