import { expect, test } from "@playwright/test";
const wedding = {
  id: "product-test",
  bride_name: "Alex",
  groom_name: "Sam",
  wedding_date: "2099-06-20",
  wedding_time: "15:00",
  event_timezone: "Asia/Tokyo",
  venue_name: "Garden Hall",
  venue_address: "Main entrance",
  contact_person: "Reception desk",
  is_published: true,
  rsvp_deadline: "2099-06-01",
  template: "minimal",
  rsvp_events: [],
};
test("coordinator sees ten wedding contexts and resolves the right exception", async ({
  page,
}) => {
  await page.route("**/api/operations/portfolio", (route) =>
    route.fulfill({
      json: {
        weddings: Array.from({ length: 10 }, (_, i) => ({
          ...wedding,
          id: `w${i}`,
          bride_name: `Client ${i}`,
        })),
        attention: [
          {
            id: "task1",
            wedding_id: "w7",
            kind: "task",
            label: "Confirm caterer arrival",
          },
        ],
      },
    }),
  );
  await page.goto("/coordinator");
  await expect(
    page.getByRole("heading", { name: "Needs attention across your weddings" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Confirm caterer/ }),
  ).toHaveAttribute("href", "/dashboard/w7/operations");
  await expect(page.getByRole("link", { name: /Client/ })).toHaveCount(11);
  await page.screenshot({
    path: "reports/coordinator-preview.png",
    fullPage: true,
  });
});
test("mobile guest can decline through the original invitation and receive an honest receipt", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/public/guest-pass?*", (route) =>
    route.fulfill({
      json: {
        wedding,
        guest: {
          id: "g1",
          guest_name: "Jordan",
          guest_email: "jordan@example.com",
          num_guests: 1,
          invited_party_size: 1,
          guest_code: "JOR-123456",
          attendance: null,
        },
      },
    }),
  );
  let body: any;
  await page.route("**/api/public/rsvp", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({
      json: {
        success: true,
        guestPass: "/guest/test-invitation-token-12345",
        notifications: { success: false },
      },
    });
  });
  await page.goto("/guest/test-invitation-token-12345");
  await page.locator("select").first().selectOption("No");
  await page
    .getByRole("button", {
      name: /Send RSVP|Confirm RSVP|Send Response|Submit RSVP/,
    })
    .click();
  await expect(
    page.getByText(
      "Your decline has been saved. Thank you for letting us know.",
    ),
  ).toBeVisible();
  expect(body.invitationToken).toBe("test-invitation-token-12345");
  expect(body.attendance).toBe("No");
  await expect(
    page.getByText(/an email notification could not be sent/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open your guest pass" }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
  await page.screenshot({ path: "reports/guest-preview.png", fullPage: true });
});
test("household RSVP captures meal and allergy details per person", async ({
  page,
}) => {
  await page.route("**/api/public/guest-pass?*", (route) =>
    route.fulfill({
      json: {
        wedding,
        guest: {
          id: "g2",
          guest_name: "Taylor",
          guest_email: "taylor@example.com",
          num_guests: 2,
          invited_party_size: 2,
          guest_code: "TAY-123456",
          attendance: null,
          children_count: 0,
        },
      },
    }),
  );
  let body: any;
  await page.route("**/api/public/rsvp", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({
      json: {
        success: true,
        guestPass: "/guest/household-invitation-token-12345",
        notifications: { success: true },
      },
    });
  });
  await page.goto("/guest/household-invitation-token-12345");
  await page.getByLabel("Name of person 2").fill("Morgan");
  await page.getByLabel("Age group for Morgan").selectOption("child");
  await page.getByLabel("Meal for Morgan").selectOption("Vegan");
  await page.getByLabel("Allergies for Morgan").fill("Peanuts");
  await page.getByRole("button", { name: /Submit RSVP/ }).click();
  await expect(page.getByText(/saved for 2 people/)).toBeVisible();
  expect(body.childrenCount).toBe(1);
  expect(body.attendees[1]).toEqual({
    name: "Morgan",
    kind: "child",
    meal: "Vegan",
    dietary: "Peanuts",
  });
});
test("operations defaults to Today and exports an offline roster", async ({
  page,
}) => {
  await page.route("**/api/operations?weddingId=*", (route) =>
    route.fulfill({
      json: {
        wedding,
        items: [],
        deliveries: [],
        guests: [
          {
            id: "g1",
            guest_name: "Jordan",
            rsvp_status: "confirmed",
            num_guests: 2,
          },
        ],
        vendors: [],
        tasks: [],
        assignments: [],
        tables: [],
        generatedAt: "2026-09-06T06:00:00Z",
      },
    }),
  );
  await page.goto("/dashboard/product-test/operations");
  await expect(
    page.getByRole("heading", { name: "Next actions" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Payment facts" }),
  ).toBeHidden();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download offline handover" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    "wedding-handover-product-test.html",
  );
  await page.getByRole("button", { name: "Payments", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Payment facts" }),
  ).toBeVisible();
  await page.screenshot({
    path: "reports/operations-preview.png",
    fullPage: true,
  });
});
test("QR camera capability and private pass assets work without third-party QR service", async ({
  request,
}) => {
  const page = await request.get("/coordinator");
  expect(page.headers()["permissions-policy"]).toContain("camera=(self)");
  const qr = await request.get(
    "/api/public/guest-qr?token=test-invitation-token-12345",
  );
  expect(qr.status()).toBe(200);
  expect(qr.headers()["content-type"]).toBe("image/png");
  const forbidden = await request.post("/api/operations", {
    data: { weddingId: "x", action: "complete" },
  });
  expect(forbidden.status()).toBe(400);
});
