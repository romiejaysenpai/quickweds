import { test, expect } from '@playwright/test';
import {
    SEED_CHECKLIST_TEMPLATES,
    buildFallbackTemplateCards,
    buildFallbackTemplatePreview,
} from '../src/lib/checklist-templates-seed';
import {
    BOX_PACKING_TEMPLATE_KEYS,
    getDaysBeforeLabel,
    getTemplateSuggestedDueDate,
} from '../src/lib/checklist-templates';

test.describe('Wedding Day Checklist Templates Data & Integrity', () => {
    test('contains all 7 required templates', () => {
        expect(SEED_CHECKLIST_TEMPLATES).toHaveLength(7);

        const keys = SEED_CHECKLIST_TEMPLATES.map((t) => t.key);
        expect(keys).toEqual([
            'brides-box',
            'grooms-box',
            'ceremony-box',
            'reception-box',
            'prep-snacks',
            'gifts-parents-entourage',
            'general-wedding-gifts',
        ]);
    });

    test("verifies Bride's Box template contents and assignments", () => {
        const bridesBox = SEED_CHECKLIST_TEMPLATES.find((t) => t.key === 'brides-box');
        expect(bridesBox).toBeDefined();

        const allItems = bridesBox!.sections.flatMap((s) => s.items);

        // Gown and petticoat — not included in the box
        const gown = allItems.find((i) => i.title.toLowerCase().includes('gown'));
        expect(gown).toBeDefined();
        expect(gown?.not_included).toBe(true);

        // Long veil — assigned to Ms. Rose
        const veil = allItems.find((i) => i.title.toLowerCase().includes('long veil'));
        expect(veil).toBeDefined();
        expect(veil?.assigned_person).toBe('Ms. Rose');

        // Retouch kit items assigned to Maid of Honor
        const retouchSection = bridesBox!.sections.find((s) => s.section_key === 'retouch_kit');
        expect(retouchSection).toBeDefined();
        expect(retouchSection!.items.length).toBe(9);
        for (const item of retouchSection!.items) {
            expect(item.assigned_person).toBe('Maid of Honor');
        }

        // Phone in gadgets assigned to Maid of Honor
        const gadgetsSection = bridesBox!.sections.find((s) => s.section_key === 'gadgets');
        expect(gadgetsSection).toBeDefined();
        const phone = gadgetsSection!.items.find((i) => i.title.toLowerCase() === 'phone');
        expect(phone).toBeDefined();
        expect(phone?.assigned_person).toBe('Maid of Honor');
    });

    test("verifies Groom's Box template contents and assignments", () => {
        const groomsBox = SEED_CHECKLIST_TEMPLATES.find((t) => t.key === 'grooms-box');
        expect(groomsBox).toBeDefined();

        // Retouch kit items assigned to Best Man
        const retouchSection = groomsBox!.sections.find((s) => s.section_key === 'retouch_kit');
        expect(retouchSection).toBeDefined();
        expect(retouchSection!.items.length).toBe(7);
        for (const item of retouchSection!.items) {
            expect(item.assigned_person).toBe('Best Man');
        }

        // Phone in gadgets assigned to Best Man
        const gadgetsSection = groomsBox!.sections.find((s) => s.section_key === 'gadgets');
        expect(gadgetsSection).toBeDefined();
        const phone = gadgetsSection!.items.find((i) => i.title.toLowerCase() === 'phone');
        expect(phone).toBeDefined();
        expect(phone?.assigned_person).toBe('Best Man');
    });

    test('verifies Ceremony Box template items and not included flags', () => {
        const ceremonyBox = SEED_CHECKLIST_TEMPLATES.find((t) => t.key === 'ceremony-box');
        expect(ceremonyBox).toBeDefined();

        const allItems = ceremonyBox!.sections.flatMap((s) => s.items);

        const unplugged = allItems.find((i) => i.title.toLowerCase().includes('unplugged'));
        expect(unplugged).toBeDefined();
        expect(unplugged?.not_included).toBe(true);

        const seatChart = allItems.find((i) => i.title.toLowerCase().includes('seat chart'));
        expect(seatChart).toBeDefined();
        expect(seatChart?.not_included).toBe(true);
    });

    test('verifies Reception Box game prizes and quantities', () => {
        const receptionBox = SEED_CHECKLIST_TEMPLATES.find((t) => t.key === 'reception-box');
        expect(receptionBox).toBeDefined();

        const gamePrizes = receptionBox!.sections.find((s) => s.section_key === 'game_prizes');
        expect(gamePrizes).toBeDefined();

        const ampao = gamePrizes!.items.find((i) => i.title.toLowerCase().includes('ampao'));
        expect(ampao?.quantity).toBe(4);

        const pepero = gamePrizes!.items.find((i) => i.title.toLowerCase().includes('pepero'));
        expect(pepero?.quantity).toBe(9);

        const raffle = gamePrizes!.items.find((i) => i.title.toLowerCase().includes('raffle'));
        expect(raffle?.quantity).toBe(9);

        const rice = gamePrizes!.items.find((i) => i.title.toLowerCase().includes('rice'));
        expect(rice?.quantity).toBe(5);
        expect(rice?.not_included).toBe(true);

        const generalItems = receptionBox!.sections.find((s) => s.section_key === 'general')!.items;
        const ledCandles = generalItems.find((i) => i.title.toLowerCase().includes('led candles'));
        expect(ledCandles?.assigned_person).toBe('Ms. Rose');

        const lightSticks = generalItems.find((i) => i.title.toLowerCase().includes('light sticks'));
        expect(lightSticks?.quantity).toBe(10);
    });

    test('verifies Prep Snacks template description and supplies', () => {
        const prepSnacks = SEED_CHECKLIST_TEMPLATES.find((t) => t.key === 'prep-snacks');
        expect(prepSnacks).toBeDefined();
        expect(prepSnacks?.description).toBe('For family, entourage, and suppliers.');

        const allItems = prepSnacks!.sections.flatMap((s) => s.items);
        expect(allItems.length).toBe(17);
    });

    test('verifies Gifts templates have editable rows structure', () => {
        const giftsParents = SEED_CHECKLIST_TEMPLATES.find((t) => t.key === 'gifts-parents-entourage');
        expect(giftsParents).toBeDefined();
        expect(giftsParents?.description).toContain('flexible checklist template with editable rows');

        const generalGifts = SEED_CHECKLIST_TEMPLATES.find((t) => t.key === 'general-wedding-gifts');
        expect(generalGifts).toBeDefined();
        expect(generalGifts!.sections.flatMap((s) => s.items).length).toBe(3);
    });

    test('buildFallbackTemplateCards produces accurate metadata', () => {
        const cards = buildFallbackTemplateCards();
        expect(cards).toHaveLength(7);
        for (const card of cards) {
            expect(card.id).toBeTruthy();
            expect(card.name).toBeTruthy();
            expect(card.description).toBeTruthy();
            expect(card.item_count).toBeGreaterThan(0);
            expect(card.section_count).toBeGreaterThan(0);
            expect(card.already_added).toBe(false);
        }
    });

    test('buildFallbackTemplatePreview produces grouped sections with badges', () => {
        const preview = buildFallbackTemplatePreview('brides-box');
        expect(preview).not.toBeNull();
        expect(preview!.template.name).toBe("Bride's Box");
        expect(preview!.sections.length).toBe(4);

        const totalItems = preview!.sections.reduce((acc, s) => acc + s.items.length, 0);
        expect(totalItems).toBe(preview!.template.item_count);
    });

    test('getTemplateSuggestedDueDate computes appropriate offsets', () => {
        const weddingDate = '2027-12-25';
        const dayBefore = getTemplateSuggestedDueDate(weddingDate, 1);
        expect(dayBefore).toBe('2027-12-24');

        const weekBefore = getTemplateSuggestedDueDate(weddingDate, 7);
        expect(weekBefore).toBe('2027-12-18');

        const label = getDaysBeforeLabel(7);
        expect(label).toBe('7 days before');

        const weddingDayLabel = getDaysBeforeLabel(0);
        expect(weddingDayLabel).toBe('Wedding day');
    });

    test('box packing keys support bride, groom, ceremony, reception, and prep snacks', () => {
        expect(BOX_PACKING_TEMPLATE_KEYS).toContain('brides-box');
        expect(BOX_PACKING_TEMPLATE_KEYS).toContain('grooms-box');
        expect(BOX_PACKING_TEMPLATE_KEYS).toContain('ceremony-box');
        expect(BOX_PACKING_TEMPLATE_KEYS).toContain('reception-box');
        expect(BOX_PACKING_TEMPLATE_KEYS).toContain('prep-snacks');
    });

    test('supports nanoid, slug, and alphanumeric wedding IDs without rejecting them', () => {
        const cleanId = (value: unknown): string => {
            const text = String(value || '').trim();
            if (!text) return '';
            const cleaned = text.replace(/[^a-zA-Z0-9_-]/g, '');
            return cleaned.slice(0, 80);
        };

        expect(cleanId('clxb38k19000108l07bzy54a2')).toBe('clxb38k19000108l07bzy54a2');
        expect(cleanId('w1234567')).toBe('w1234567');
        expect(cleanId('demo-wedding')).toBe('demo-wedding');
        expect(cleanId('b8e762c9-9407-4e7c-8647-380d32f7823e')).toBe('b8e762c9-9407-4e7c-8647-380d32f7823e');
        expect(cleanId('')).toBe('');
    });

    test('extracts missing column name from PostgREST schema cache error', () => {
        const getMissingColumnName = (error: any): string | null => {
            if (!error) return null;
            const message = String(error.message || error.details || error.hint || '').toLowerCase();
            const match1 = message.match(/could not find the '([^']+)' column/);
            if (match1 && match1[1]) return match1[1];
            const match2 = message.match(/column "([^"]+)" of relation/);
            if (match2 && match2[1]) return match2[1];
            const match3 = message.match(/column "([^"]+)" does not exist/);
            if (match3 && match3[1]) return match3[1];
            const match4 = message.match(/column ([a-z0-9_]+) does not exist/);
            if (match4 && match4[1]) return match4[1];
            const match5 = message.match(/'([^']+)' column of 'planner_tasks'/);
            if (match5 && match5[1]) return match5[1];
            return null;
        };

        const postgrestError = {
            message: "Could not find the 'due_date' column of 'planner_tasks' in the schema cache",
        };
        expect(getMissingColumnName(postgrestError)).toBe('due_date');

        const postgresError = {
            message: 'column "due_date" of relation "planner_tasks" does not exist',
        };
        expect(getMissingColumnName(postgresError)).toBe('due_date');
    });

    test('TASK_META_SEPARATOR encodes and decodes metadata seamlessly', () => {
        const TASK_META_SEPARATOR = '||QW_TASK_META||';
        const meta = {
            section: "Bride's Box",
            due_date: '2027-10-15',
            assigned_to: 'Ms. Rose',
            notes: 'Hand over before ceremony',
        };

        const encodedCategory = `${meta.section}${TASK_META_SEPARATOR}${JSON.stringify(meta)}`;
        expect(encodedCategory).toContain("Bride's Box||QW_TASK_META||");

        const [section, rawMeta] = encodedCategory.split(TASK_META_SEPARATOR);
        const parsed = JSON.parse(rawMeta);

        expect(section).toBe("Bride's Box");
        expect(parsed.due_date).toBe('2027-10-15');
        expect(parsed.assigned_to).toBe('Ms. Rose');
    });

    test('isTaskDuplicate accurately detects duplicate items and prevents duplication', () => {
        const normalizeText = (val: unknown): string => {
            return String(val || '')
                .trim()
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/[—–]/g, '-');
        };

        const isTaskDuplicate = (
            existingTask: Record<string, any>,
            candidateTask: Record<string, any>,
            templateKey: string,
            checklistName: string,
        ): boolean => {
            const existingTitle = normalizeText(existingTask.title);
            const candidateTitle = normalizeText(candidateTask.title);

            if (!existingTitle || existingTitle !== candidateTitle) {
                return false;
            }

            const existingTemplateKey = normalizeText(existingTask.source_template_key || existingTask.template_key || '');
            const normalizedTargetKey = normalizeText(templateKey);

            if (
                existingTemplateKey &&
                normalizedTargetKey &&
                existingTemplateKey !== normalizedTargetKey &&
                existingTemplateKey !== `checklist-template:${normalizedTargetKey}`
            ) {
                return false;
            }

            // 1. Matches by template key
            if (
                existingTemplateKey &&
                (existingTemplateKey === normalizedTargetKey ||
                 existingTemplateKey === `checklist-template:${normalizedTargetKey}`)
            ) {
                return true;
            }

            // 2. Matches by exact section or category
            const existingSection = normalizeText(existingTask.section || existingTask.category || '');
            const candidateSection = normalizeText(candidateTask.section || candidateTask.category || '');
            if (existingSection && candidateSection && existingSection === candidateSection) {
                return true;
            }

            // 3. Matches if both sections contain the checklist name (e.g. "Bride's Box")
            const normalizedChecklistName = normalizeText(checklistName);
            if (
                normalizedChecklistName &&
                existingSection &&
                candidateSection &&
                existingSection.includes(normalizedChecklistName) &&
                candidateSection.includes(normalizedChecklistName)
            ) {
                return true;
            }

            // 4. Matches by location (e.g. "Bride's Box")
            const existingLocation = normalizeText(existingTask.location || '');
            const candidateLocation = normalizeText(candidateTask.location || '');
            if (existingLocation && candidateLocation && existingLocation === candidateLocation) {
                return true;
            }

            // 5. If neither has section or location
            if (!existingSection && !candidateSection && !existingLocation && !candidateLocation) {
                return true;
            }

            return false;
        };

        // Case 1: Same title and template key -> duplicate
        expect(isTaskDuplicate(
            { title: 'Long veil', source_template_key: 'brides-box', section: "Bride's Box" },
            { title: 'Long veil', source_template_key: 'brides-box', section: "Bride's Box" },
            'brides-box',
            "Bride's Box",
        )).toBe(true);

        // Case 2: Same title with slight casing/dash differences -> duplicate
        expect(isTaskDuplicate(
            { title: 'Perfume — personal use', section: "Bride's Box" },
            { title: 'Perfume - personal use', section: "Bride's Box" },
            'brides-box',
            "Bride's Box",
        )).toBe(true);

        // Case 3: Same title in another box (e.g. Groom's Box Invitation vs Bride's Box Invitation) -> NOT duplicate
        expect(isTaskDuplicate(
            { title: 'Invitation — 1 pc', source_template_key: 'grooms-box', section: "Groom's Box" },
            { title: 'Invitation — 1 pc', source_template_key: 'brides-box', section: "Bride's Box" },
            'brides-box',
            "Bride's Box",
        )).toBe(false);

        // Case 4: Batch filter skips already added items
        const existingTasks = [
            { title: 'Gown and petticoat', section: "Bride's Box" },
            { title: 'Long veil', section: "Bride's Box" },
        ];

        const candidates = [
            { title: 'Gown and petticoat', section: "Bride's Box" },
            { title: 'Long veil', section: "Bride's Box" },
            { title: 'Sandals', section: "Bride's Box" },
        ];

        const nonDuplicates = candidates.filter((c) =>
            !existingTasks.some((e) => isTaskDuplicate(e, c, 'brides-box', "Bride's Box"))
        );

        expect(nonDuplicates).toHaveLength(1);
        expect(nonDuplicates[0].title).toBe('Sandals');
    });
});

