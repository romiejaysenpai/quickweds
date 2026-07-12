import { expect, test } from '@playwright/test';
import { getPostLoginRedirect } from '../src/lib/account';

test.describe('post-login routing', () => {
    test('sends an existing couple directly to their wedding dashboard', () => {
        expect(getPostLoginRedirect({
            user_id: 'returning-user', account_type: 'couple', onboarding_completed: true,
            has_weddings: true, dashboard_path: '/dashboard/wedding-1',
        }, '/dashboard')).toBe('/dashboard/wedding-1');
    });

    test('sends a first-time user to onboarding', () => {
        expect(getPostLoginRedirect({
            user_id: 'new-user', account_type: null, onboarding_completed: false, has_weddings: false,
        }, '/builder')).toBe('/onboarding/account-type?next=%2Fbuilder');
    });

    test('keeps an explicitly authorized wedding destination', () => {
        expect(getPostLoginRedirect({
            user_id: 'collaborator', account_type: 'couple', onboarding_completed: true,
            has_weddings: true, dashboard_path: '/dashboard/authorized',
        }, '/dashboard/authorized/planner')).toBe('/dashboard/authorized/planner');
    });
});
