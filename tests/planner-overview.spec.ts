import { test, expect } from "@playwright/test";
test("planner overview works on mobile and records a gift and its thank-you completion", async ({
  page,
}) => {
  const weddingId = "11111111-1111-4111-8111-111111111111";
  const user = {
    id: "22222222-2222-4222-8222-222222222222",
    email: "synthetic@example.test",
    aud: "authenticated",
    role: "authenticated",
    user_metadata: {},
    app_metadata: {},
  };
  await page.addInitScript(
    ({ user }) => {
      localStorage.setItem(
        "sb-jioouyzzitvtlpzqqbkz-auth-token",
        JSON.stringify({
          access_token: "synthetic-access-token",
          refresh_token: "synthetic-refresh-token",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: "bearer",
          user,
        }),
      );
    },
    { user },
  );
  const wedding = {
    id: weddingId,
    user_id: user.id,
    bride_name: "Synthetic",
    groom_name: "Couple",
    currency: "USD",
    is_premium: true,
    rsvp_events: [],
  };
  const data = {
    wedding,
    planner_tasks: [],
    planner_budgets: [],
    planner_vendors: [],
    planner_food_drinks: [],
    planner_gifts: [] as Record<string, unknown>[],
    planner_payment_milestones: [],
    planner_activity: [],
    rsvps: [],
    seating_assignments: [],
  };
  await page.route("**/api/**", (route) => route.fulfill({ json: {} }));
  await page.route("**/api/auth/check-admin", (route) =>
    route.fulfill({ json: { isAdmin: false } }),
  );
  await page.route("**/api/account/profile", (route) =>
    route.fulfill({
      json: { profile: { account_type: "couple", is_pro: true } },
    }),
  );
  await page.route("**/api/planner/load?**", (route) =>
    route.fulfill({
      json: { wedding, accessRole: "owner", accountProfile: { is_pro: true } },
    }),
  );
  let failRefresh = false;
  await page.route("**/api/planner/progress?**", async (route) => {
    const method = route.request().method();
    if (method === "GET" && failRefresh)
      return route.fulfill({
        status: 503,
        json: { error: "Synthetic refresh failure" },
      });
    if (method === "POST")
      data.planner_gifts.push({
        ...route.request().postDataJSON(),
        thank_you_completed_at: null,
      });
    if (method === "PATCH") {
      const update = route.request().postDataJSON();
      const row = data.planner_gifts.find((row) => row.id === update.id);
      if (row)
        row.thank_you_completed_at = update.complete
          ? new Date().toISOString()
          : null;
    }
    await route.fulfill({ json: method === "GET" ? data : { success: true } });
  });
  await page.route("**/api/planner/delivery?**", (route) =>
    route.fulfill({ json: { jobs: [] } }),
  );
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/dashboard/${weddingId}/planner?tab=overview`);
  await expect(
    page.getByRole("heading", { name: "Planning overview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Caterer summary" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(2);
  await page.getByLabel("Record type").selectOption("gift");
  await page.getByLabel("From", { exact: true }).fill("Synthetic Guest");
  await page.getByLabel("Gift details").fill("A thoughtful card");
  await page.getByRole("button", { name: "Save record" }).click();
  await expect(
    page.getByText("Synthetic Guest · A thoughtful card"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mark thanked", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mark not thanked", exact: true }),
  ).toBeVisible();
  failRefresh = true;
  await page.getByLabel("From", { exact: true }).fill("Second Guest");
  await page.getByLabel("Gift details").fill("Saved despite refresh failure");
  await page.getByRole("button", { name: "Save record" }).click();
  await expect(page.getByText(/Your change was saved/)).toBeVisible();
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Gift details")).toHaveValue("");
  expect(data.planner_gifts).toHaveLength(2);
  await page.setViewportSize({ width: 1440, height: 900 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(2);
});
