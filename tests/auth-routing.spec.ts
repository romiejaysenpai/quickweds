import { expect, test } from '@playwright/test';
import { getPostLoginRedirect } from '../src/lib/account';

test.describe('post-login routing', () => {
    test('sends an existing couple to the welcome dashboard on default login', () => {
        expect(getPostLoginRedirect({
            user_id: 'returning-user', account_type: 'couple', onboarding_completed: true,
            has_weddings: true, dashboard_path: '/dashboard/wedding-1',
        }, '/dashboard')).toBe('/dashboard');
    });

    test('sends a returning couple to the welcome dashboard even when coming from builder', () => {
        expect(getPostLoginRedirect({
            user_id: 'returning-user', account_type: 'couple', onboarding_completed: true,
            has_weddings: true, dashboard_path: '/dashboard/wedding-1',
        }, '/builder')).toBe('/dashboard');
    });

    test('sends a returning couple to the welcome dashboard even with an explicit wedding path', () => {
        expect(getPostLoginRedirect({
            user_id: 'returning-user', account_type: 'couple', onboarding_completed: true,
            has_weddings: true, dashboard_path: '/dashboard/wedding-1',
        }, '/dashboard/wedding-1/planner')).toBe('/dashboard');
    });

    test('sends a first-time user to onboarding', () => {
        expect(getPostLoginRedirect({
            user_id: 'new-user', account_type: null, onboarding_completed: false, has_weddings: false,
        }, '/builder')).toBe('/onboarding/account-type?next=%2Fbuilder');
    });

    test('sends a legacy user without account type to onboarding', () => {
        expect(getPostLoginRedirect({
            user_id: 'legacy-user', account_type: null, onboarding_completed: false,
            has_weddings: true, dashboard_path: '/dashboard/wedding-1',
        }, '/builder')).toBe('/onboarding/account-type?next=%2Fbuilder');
    });

    test('sends a returning couple without weddings to the welcome dashboard', () => {
        expect(getPostLoginRedirect({
            user_id: 'couple-no-weddings', account_type: 'couple', onboarding_completed: true,
            has_weddings: false,
        }, '/dashboard')).toBe('/dashboard');
    });
});