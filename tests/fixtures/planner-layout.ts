import type { Page } from '@playwright/test';

export const layoutWeddingId = '11111111-1111-4111-8111-111111111111';

export async function mockPlannerLayout(page: Page) {
  const user = { id: '22222222-2222-4222-8222-222222222222', email: 'layout@example.test', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
  await page.addInitScript(({ user }) => {
    localStorage.setItem('sb-jioouyzzitvtlpzqqbkz-auth-token', JSON.stringify({ access_token: 'synthetic-access-token', refresh_token: 'synthetic-refresh-token', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user }));
  }, { user });
  const wedding = { id: layoutWeddingId, user_id: user.id, bride_name: 'Alexandria Isabella', groom_name: 'Christopher Alexander', currency: 'PHP', is_premium: true, total_budget: 280000, guest_limit: 150, wedding_date: '2027-12-18', wedding_party: [], rsvp_events: [] };
  const budgets = [{ id: 'layout-expense', wedding_id: layoutWeddingId, item_name: 'Reception venue with a longer descriptive name', category: 'Venue', estimated_cost: 43000, actual_cost: 44000, is_paid: false, due_date: '2027-10-18' }];
  await page.route(/^https:\/\//, async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.startsWith('/rest/v1/')) return route.fulfill({ json: path.endsWith('/seating_layouts') ? null : [] });
    if (path.endsWith('/auth/v1/user')) return route.fulfill({ json: user });
    return route.abort();
  });
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const responses: Record<string, unknown> = {
      '/api/auth/check-admin': { isAdmin: false },
      '/api/account/profile': { profile: { account_type: 'couple', is_pro: true } },
      '/api/planner/load': { wedding, accessRole: 'owner', accountProfile: { is_pro: true }, budgets, tasks: [], vendors: [], events: [], foodDrinks: [], honeymoonItems: [] },
      '/api/planner/progress': { wedding, planner_tasks: [], planner_budgets: budgets, planner_vendors: [], planner_food_drinks: [], planner_gifts: [], planner_payment_milestones: [], planner_activity: [], rsvps: [], seating_assignments: [] },
      '/api/planner/delivery': { jobs: [] },
      '/api/seating/check-in': { guests: [] },
      '/api/photos/portal': { hasPro: true, settings: { disposable_camera_enabled: true }, photos: [], codes: [{ id: 'layout-code', code: 'WEDDING', is_active: true }] },
      '/api/wedding-day/settings': { wedding, settings: { is_enabled: true, emergency_contacts: [{ name: 'Long coordinator name', role: 'Venue coordinator', phone: '09123456789' }], coordinator_notes: '' } },
      '/api/dashboard/counters': { counters: {} },
    };
    return route.fulfill({ json: responses[path] || {} });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

/** Detect fields escaping an ancestor even when a page clips horizontal overflow. */
export async function escapedFields(page: Page) {
  return page.locator('input:not([type="checkbox"]):not([type="radio"]), select, textarea').evaluateAll(fields => fields.flatMap(field => {
    const bounds = field.getBoundingClientRect();
    if (!bounds.width || !bounds.height || getComputedStyle(field).visibility === 'hidden') return [];
    let parent = field.parentElement;
    while (parent && parent !== document.body) {
      if (['auto', 'scroll'].includes(getComputedStyle(parent).overflowX)) break;
      const box = parent.getBoundingClientRect();
      if (box.width && (bounds.left < box.left - 2 || bounds.right > box.right + 2)) return [{ field: field.getAttribute('aria-label') || field.getAttribute('placeholder') || field.getAttribute('type'), parent: parent.className }];
      parent = parent.parentElement;
    }
    return [];
  }));
}
