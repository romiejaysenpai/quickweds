import { expect, test } from '@playwright/test';
import { getPostLoginRedirect } from '../src/lib/account';

test.describe('post-login routing', () => {
    test('sends an existing couple with a wedding to the dashboard instead of the builder', () => {
        expect(getPostLoginRedirect({
            user_id: 'returning-user',
            account_type: 'couple',
            onboarding_completed: true,
        }, '/builder')).toBe('/dashboard');

        expect(getPostLoginRedirect({
            user_id: 'returning-user',
            account_type: 'couple',
            onboarding_completed: true,
        }, '/builder?edit=wedding-1')).toBe('/dashboard');
    });

    test('sends a first-time user to onboarding', () => {
        expect(getPostLoginRedirect({
            user_id: 'new-user',
            account_type: null,
            onboarding_completed: false,
        }, '/builder')).toBe('/onboarding/account-type?next=%2Fbuilder');
    });

    test('preserves non-builder destinations for an existing couple', () => {
        expect(getPostLoginRedirect({
            user_id: 'returning-user',
            account_type: 'couple',
            onboarding_completed: true,
        }, '/settings')).toBe('/settings');
    });
});
