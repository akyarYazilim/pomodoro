/**
 * E2E test seed — Playwright testleri için hazır veri oluşturur.
 * Kullanım: tests/e2e içinden veya playwright global setup'tan çağrılır.
 */

export const TEST_USER = {
  name: "E2E Test User",
  email: "e2e@test.example.com",
  password: "E2ETest1234!",
}

export async function seedTestUser() {
  const res = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(TEST_USER),
  })

  if (!res.ok && res.status !== 409) {
    throw new Error(`Seed failed: ${res.status} ${await res.text()}`)
  }
}
