import { test, expect } from "@playwright/test"

test.describe("Auth Akışı", () => {
  test("kayıt ol → giriş yap → dashboard", async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`

    // Kayıt
    await page.goto("/register")
    await page.fill('[name="name"]', "Test Kullanıcı")
    await page.fill('[name="email"]', testEmail)
    await page.fill('[name="password"]', "Test1234!")
    await page.click('[type="submit"]')
    await expect(page).toHaveURL("/login")

    // Giriş
    await page.fill('[name="email"]', testEmail)
    await page.fill('[name="password"]', "Test1234!")
    await page.click('[type="submit"]')
    await expect(page).toHaveURL("/")
  })

  test("yetkisiz erişim /login'e yönlendirir", async ({ page }) => {
    await page.goto("/timer")
    await expect(page).toHaveURL("/login")
  })

  test("giriş yapmış kullanıcı /login'e erişemez", async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`

    // Önce kayıt ol
    await page.goto("/register")
    await page.fill('[name="name"]', "Test Kullanıcı")
    await page.fill('[name="email"]', testEmail)
    await page.fill('[name="password"]', "Test1234!")
    await page.click('[type="submit"]')

    // Giriş yap
    await page.goto("/login")
    await page.fill('[name="email"]', testEmail)
    await page.fill('[name="password"]', "Test1234!")
    await page.click('[type="submit"]')
    await expect(page).toHaveURL("/")

    // /login'e tekrar gitmeye çalış
    await page.goto("/login")
    await expect(page).toHaveURL("/")
  })

  test("çıkış yap", async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`

    // Kayıt + giriş
    await page.goto("/register")
    await page.fill('[name="name"]', "Test Kullanıcı")
    await page.fill('[name="email"]', testEmail)
    await page.fill('[name="password"]', "Test1234!")
    await page.click('[type="submit"]')

    await page.goto("/login")
    await page.fill('[name="email"]', testEmail)
    await page.fill('[name="password"]', "Test1234!")
    await page.click('[type="submit"]')

    // Çıkış yap
    await page.click('[data-testid="logout-button"]')
    await expect(page).toHaveURL("/login")
  })
})
