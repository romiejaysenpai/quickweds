import type {
    ChecklistTemplate,
    ChecklistTemplateItem,
    ChecklistTemplatePreview,
    ChecklistTemplateSection,
} from './checklist-templates';

export interface SeedItemDefinition {
    item_key: string;
    title: string;
    description?: string;
    notes?: string;
    is_optional?: boolean;
    quantity?: number;
    assigned_person?: string | null;
    location?: string | null;
    not_included?: boolean;
    due_offset_days?: number | null;
}

export interface SeedSectionDefinition {
    section_key: string;
    name: string;
    items: SeedItemDefinition[];
}

export interface SeedTemplateDefinition {
    id: string;
    key: string;
    name: string;
    description: string;
    category: string;
    supports_box_packing: boolean;
    sections: SeedSectionDefinition[];
}

export const SEED_CHECKLIST_TEMPLATES: SeedTemplateDefinition[] = [
    // 1. BRIDE'S BOX
    {
        id: 'c1000000-0000-0000-0000-000000000001',
        key: 'brides-box',
        name: "Bride's Box",
        description: 'Essential bride-prep items, jewelry, retouch kits, and wedding-day emergency gear.',
        category: 'wedding-day',
        supports_box_packing: true,
        sections: [
            {
                section_key: 'general',
                name: 'General',
                items: [
                    { item_key: 'bb-gown-petticoat', title: 'Gown and petticoat', not_included: true, location: "Bride's Box", due_offset_days: 1 },
                    { item_key: 'bb-long-veil', title: 'Long veil', assigned_person: 'Ms. Rose', location: "Bride's Box", due_offset_days: 1 },
                    { item_key: 'bb-sandals', title: 'Sandals', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-backup-sandals', title: 'Backup/prep sandals', is_optional: true, location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-prep-dress', title: 'Prep dress', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-perfume-personal', title: 'Perfume - personal use', notes: 'Personal use', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-perfume-photoshoot', title: 'Perfume - photoshoot only', notes: 'Photoshoot only', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-earrings', title: 'Earrings', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-bracelet', title: 'Bracelet', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-wedding-rings', title: 'Wedding rings', location: "Bride's Box", due_offset_days: 1 },
                    { item_key: 'bb-engagement-ring', title: 'Engagement ring', location: "Bride's Box", due_offset_days: 1 },
                    { item_key: 'bb-invitation', title: 'Invitation - 1 pc', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-vow', title: 'Vow', location: "Bride's Box", due_offset_days: 1 },
                    { item_key: 'bb-cash-payments', title: 'Cash payments', notes: 'For cash gifts and final payments', location: "Bride's Box", due_offset_days: 1 },
                    { item_key: 'bb-medicines', title: 'Medicines', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-bridal-bag', title: 'Bridal bag', notes: 'For cash gifts', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-hankies', title: 'Hankies', location: "Bride's Box", due_offset_days: 30 },
                    { item_key: 'bb-toiletries', title: 'Toiletries', location: "Bride's Box", due_offset_days: 30 },
                    { item_key: 'bb-tumbler', title: 'Tumbler', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-straw', title: 'Straw', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-steamer', title: 'Steamer', location: "Bride's Box", due_offset_days: 30 },
                    { item_key: 'bb-undergarments', title: 'Undergarments', location: "Bride's Box", due_offset_days: 30 },
                    { item_key: 'bb-backup-undergarments', title: 'Backup undergarments', is_optional: true, location: "Bride's Box", due_offset_days: 30 },
                    { item_key: 'bb-contracts-folder', title: 'Contracts folder', notes: 'Supplier contracts and receipts', location: "Bride's Box", due_offset_days: 7 },
                    { item_key: 'bb-snacks', title: 'Snacks', location: "Bride's Box", due_offset_days: 30 },
                ],
            },
            {
                section_key: 'emergency_kit',
                name: 'Emergency kit',
                items: [
                    { item_key: 'bb-ek-sewing-kit', title: 'Sewing kit', location: 'Emergency kit', due_offset_days: 30 },
                    { item_key: 'bb-ek-fashion-tape', title: 'Fashion tape', location: 'Emergency kit', due_offset_days: 30 },
                    { item_key: 'bb-ek-lint-roller', title: 'Lint roller', location: 'Emergency kit', due_offset_days: 30 },
                    { item_key: 'bb-ek-shoe-glue', title: 'Shoe glue', location: 'Emergency kit', due_offset_days: 30 },
                    { item_key: 'bb-ek-heel-protect-tape', title: 'Heel protect tape', location: 'Emergency kit', due_offset_days: 30 },
                    { item_key: 'bb-ek-tide-pen', title: 'Tide-to-go pen', location: 'Emergency kit', due_offset_days: 30 },
                ],
            },
            {
                section_key: 'retouch_kit',
                name: 'Retouch kit',
                items: [
                    { item_key: 'bb-rk-oil-film', title: 'Oil film', assigned_person: 'Maid of Honor', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'bb-rk-tissue', title: 'Tissue', assigned_person: 'Maid of Honor', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'bb-rk-wipes', title: 'Wipes', assigned_person: 'Maid of Honor', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'bb-rk-lipstick', title: 'Lipstick', assigned_person: 'Maid of Honor', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'bb-rk-mini-perfume', title: 'Mini perfume', assigned_person: 'Maid of Honor', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'bb-rk-mint', title: 'Mint', assigned_person: 'Maid of Honor', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'bb-rk-mouth-spray', title: 'Mouth spray', assigned_person: 'Maid of Honor', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'bb-rk-alcohol', title: 'Alcohol', assigned_person: 'Maid of Honor', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'bb-rk-floss', title: 'Floss', assigned_person: 'Maid of Honor', location: 'Retouch kit', due_offset_days: 30 },
                ],
            },
            {
                section_key: 'gadgets',
                name: 'Gadgets',
                items: [
                    { item_key: 'bb-gd-charger', title: 'Charger', location: 'Gadgets', due_offset_days: 30 },
                    { item_key: 'bb-gd-phone', title: 'Phone', assigned_person: 'Maid of Honor', location: 'Gadgets', due_offset_days: 30 },
                    { item_key: 'bb-gd-mini-fan', title: 'Mini fan', location: 'Gadgets', due_offset_days: 30 },
                    { item_key: 'bb-gd-power-bank', title: 'Power bank', is_optional: true, location: 'Gadgets', due_offset_days: 30 },
                ],
            },
        ],
    },

    // 2. GROOM'S BOX
    {
        id: 'c1000000-0000-0000-0000-000000000002',
        key: 'grooms-box',
        name: "Groom's Box",
        description: "Groom's attire, accessories, retouch kit, gadgets, and emergency prep essentials.",
        category: 'wedding-day',
        supports_box_packing: true,
        sections: [
            {
                section_key: 'general',
                name: 'General',
                items: [
                    { item_key: 'gb-shoes', title: 'Shoes', location: "Groom's Box", due_offset_days: 7 },
                    { item_key: 'gb-watch', title: 'Watch', location: "Groom's Box", due_offset_days: 1 },
                    { item_key: 'gb-socks', title: 'Socks', location: "Groom's Box", due_offset_days: 7 },
                    { item_key: 'gb-hankies', title: 'Hankies', location: "Groom's Box", due_offset_days: 30 },
                    { item_key: 'gb-perfume-personal', title: 'Perfume - personal use', notes: 'Personal use', location: "Groom's Box", due_offset_days: 7 },
                    { item_key: 'gb-perfume-photoshoot', title: 'Perfume - photoshoot only', notes: 'Photoshoot only', location: "Groom's Box", due_offset_days: 7 },
                    { item_key: 'gb-invitation', title: 'Invitation - 1 pc', location: "Groom's Box", due_offset_days: 7 },
                    { item_key: 'gb-vow', title: 'Vow', location: "Groom's Box", due_offset_days: 1 },
                    { item_key: 'gb-undergarments', title: 'Undergarments', location: "Groom's Box", due_offset_days: 30 },
                    { item_key: 'gb-backup-undergarments', title: 'Backup undergarments', is_optional: true, location: "Groom's Box", due_offset_days: 30 },
                    { item_key: 'gb-toiletries', title: 'Toiletries', location: "Groom's Box", due_offset_days: 30 },
                    { item_key: 'gb-steamer', title: 'Steamer', location: "Groom's Box", due_offset_days: 30 },
                    { item_key: 'gb-snacks', title: 'Snacks', location: "Groom's Box", due_offset_days: 30 },
                    { item_key: 'gb-belt', title: 'Belt', location: "Groom's Box", due_offset_days: 7 },
                ],
            },
            {
                section_key: 'emergency_kit',
                name: 'Emergency kit',
                items: [
                    { item_key: 'gb-ek-lint-roller', title: 'Lint roller', location: 'Emergency kit', due_offset_days: 30 },
                    { item_key: 'gb-ek-shoe-glue', title: 'Shoe glue', location: 'Emergency kit', due_offset_days: 30 },
                    { item_key: 'gb-ek-heel-protect-tape', title: 'Heel protect tape', location: 'Emergency kit', due_offset_days: 30 },
                    { item_key: 'gb-ek-tide-pen', title: 'Tide-to-go pen', location: 'Emergency kit', due_offset_days: 30 },
                ],
            },
            {
                section_key: 'retouch_kit',
                name: 'Retouch kit',
                items: [
                    { item_key: 'gb-rk-oil-film', title: 'Oil film', assigned_person: 'Best Man', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'gb-rk-tissue', title: 'Tissue', assigned_person: 'Best Man', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'gb-rk-mint', title: 'Mint', assigned_person: 'Best Man', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'gb-rk-mini-perfume', title: 'Mini perfume', assigned_person: 'Best Man', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'gb-rk-mouth-spray', title: 'Mouth spray', assigned_person: 'Best Man', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'gb-rk-lip-balm', title: 'Lip balm', assigned_person: 'Best Man', location: 'Retouch kit', due_offset_days: 30 },
                    { item_key: 'gb-rk-floss', title: 'Floss', assigned_person: 'Best Man', location: 'Retouch kit', due_offset_days: 30 },
                ],
            },
            {
                section_key: 'gadgets',
                name: 'Gadgets',
                items: [
                    { item_key: 'gb-gd-charger', title: 'Charger', location: 'Gadgets', due_offset_days: 30 },
                    { item_key: 'gb-gd-phone', title: 'Phone', assigned_person: 'Best Man', location: 'Gadgets', due_offset_days: 30 },
                    { item_key: 'gb-gd-mini-fan', title: 'Mini fan', location: 'Gadgets', due_offset_days: 30 },
                ],
            },
        ],
    },

    // 3. CEREMONY BOX
    {
        id: 'c1000000-0000-0000-0000-000000000003',
        key: 'ceremony-box',
        name: 'Ceremony Box',
        description: 'Ceremony essentials including arras, bible, veil, cord, candles, and signage.',
        category: 'wedding-day',
        supports_box_packing: true,
        sections: [
            {
                section_key: 'general',
                name: 'General',
                items: [
                    { item_key: 'cb-arras', title: 'Arras with coins', location: 'Ceremony Box', due_offset_days: 7 },
                    { item_key: 'cb-bible', title: 'Bible', location: 'Ceremony Box', due_offset_days: 7 },
                    { item_key: 'cb-short-veil', title: 'Short veil', location: 'Ceremony Box', due_offset_days: 7 },
                    { item_key: 'cb-cord', title: 'Cord', location: 'Ceremony Box', due_offset_days: 7 },
                    { item_key: 'cb-candles', title: 'Candles', location: 'Ceremony Box', due_offset_days: 7 },
                    { item_key: 'cb-matches', title: 'Matches', location: 'Ceremony Box', due_offset_days: 7 },
                    { item_key: 'cb-petals', title: 'Petals - for recession', notes: 'Recession', location: 'Ceremony Box', due_offset_days: 1 },
                    { item_key: 'cb-wands', title: 'Wands - for recession', notes: 'Recession', location: 'Ceremony Box', due_offset_days: 1 },
                    { item_key: 'cb-marriage-license', title: 'Marriage license', location: 'Ceremony Box', due_offset_days: 1 },
                    { item_key: 'cb-pens', title: 'Pens', location: 'Ceremony Box', due_offset_days: 7 },
                    { item_key: 'cb-unplugged-sign', title: 'Unplugged ceremony sign/chart', notes: 'Not included in the box', not_included: true, location: 'Ceremony Box', due_offset_days: 1 },
                    { item_key: 'cb-seat-chart', title: 'Seat chart', notes: 'Not included in the box', not_included: true, location: 'Ceremony Box', due_offset_days: 1 },
                ],
            },
        ],
    },

    // 4. RECEPTION BOX
    {
        id: 'c1000000-0000-0000-0000-000000000004',
        key: 'reception-box',
        name: 'Reception Box',
        description: 'Reception-day items for games, souvenirs, grand entrances, and capturing photos and video.',
        category: 'wedding-day',
        supports_box_packing: true,
        sections: [
            {
                section_key: 'general',
                name: 'General',
                items: [
                    { item_key: 'rb-guest-souvenirs', title: 'Guest souvenirs', location: 'Reception Box', due_offset_days: 7 },
                    { item_key: 'rb-money-envelope', title: 'Money envelope', location: 'Reception Box', due_offset_days: 7 },
                    { item_key: 'rb-pens', title: 'Pens', location: 'Reception Box', due_offset_days: 7 },
                    { item_key: 'rb-scratch-cards', title: 'Scratch cards', location: 'Reception Box', due_offset_days: 7 },
                    { item_key: 'rb-menu-cards', title: 'Menu cards', location: 'Reception Box', due_offset_days: 7 },
                    { item_key: 'rb-place-cards', title: 'Place cards', location: 'Reception Box', due_offset_days: 7 },
                    { item_key: 'rb-led-candles', title: 'LED candles', assigned_person: 'Ms. Rose', location: 'Reception Box', due_offset_days: 1 },
                    { item_key: 'rb-led-light-sticks', title: 'LED light sticks', notes: '10 pcs, for entourage grand entrance', quantity: 10, location: 'Reception Box', due_offset_days: 1 },
                    { item_key: 'rb-throw-petals', title: 'Throw petals', notes: "For the couple's grand entrance", location: 'Reception Box', due_offset_days: 1 },
                    { item_key: 'rb-sunglasses', title: 'Sunglasses', notes: 'For reception entrance and family dance', location: 'Reception Box', due_offset_days: 1 },
                    { item_key: 'rb-petal-poppers', title: 'Petal poppers', notes: "For the couple's first dance", location: 'Reception Box', due_offset_days: 1 },
                    { item_key: 'rb-hard-drive', title: 'Hard drive', notes: 'For photos and video', location: 'Reception Box', due_offset_days: 1 },
                ],
            },
            {
                section_key: 'game_prizes',
                name: 'Game prizes',
                items: [
                    { item_key: 'rb-gp-ampao', title: '4 ampao', quantity: 4, location: 'Game prizes', due_offset_days: 7 },
                    { item_key: 'rb-gp-pepero', title: '9 pieces Pepero', quantity: 9, location: 'Game prizes', due_offset_days: 7 },
                    { item_key: 'rb-gp-raffle-prizes', title: '9 raffle prizes', quantity: 9, location: 'Game prizes', due_offset_days: 7 },
                    { item_key: 'rb-gp-rice', title: '5 sacks of rice', notes: 'Not included in the box', not_included: true, quantity: 5, location: 'Game prizes', due_offset_days: 7 },
                ],
            },
        ],
    },

    // 5. PREP SNACKS
    {
        id: 'c1000000-0000-0000-0000-000000000005',
        key: 'prep-snacks',
        name: 'Prep Snacks',
        description: 'For family, entourage, and suppliers.',
        category: 'wedding-day',
        supports_box_packing: true,
        sections: [
            {
                section_key: 'general',
                name: 'General',
                items: [
                    { item_key: 'ps-hankies-mints', title: 'Hankies and mints', notes: 'Distribute during prep', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-coffee', title: 'Coffee', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-milo', title: 'Milo', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-kettle', title: 'Electric kettle', notes: 'For hot drinks', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-paper-cups', title: 'Paper cups', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-utensils', title: 'Utensils', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-stirrers', title: 'Stirrers', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-tissue', title: 'Tissue', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-wipes', title: 'Wipes', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-garbage-bags', title: 'Garbage bags', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-eco-bags', title: 'Eco bags', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-food-containers', title: 'Food containers', notes: 'For leftovers', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-scissors', title: 'Scissors', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-ziplock-bags', title: 'Ziplock bags', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-hand-soap', title: 'Hand soap', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-pens', title: 'Pens', location: 'Prep Snacks', due_offset_days: 30 },
                    { item_key: 'ps-adapter', title: 'Adapter', location: 'Prep Snacks', due_offset_days: 30 },
                ],
            },
        ],
    },

    // 6. GIFTS FOR PARENTS AND ENTOURAGE
    {
        id: 'c1000000-0000-0000-0000-000000000006',
        key: 'gifts-parents-entourage',
        name: 'Gifts for Parents and Entourage',
        description: 'This should be a flexible checklist template with editable rows:',
        category: 'wedding-day',
        supports_box_packing: false,
        sections: [
            {
                section_key: 'general',
                name: 'General',
                items: [
                    { item_key: 'gpe-sponsors', title: 'Gifts for principal sponsors', location: 'Gifts', due_offset_days: 14 },
                    { item_key: 'gpe-reverend', title: 'Gift for Reverend', location: 'Gifts', due_offset_days: 14 },
                    { item_key: 'gpe-suppliers', title: 'Small tokens for suppliers', location: 'Gifts', due_offset_days: 14 },
                ],
            },
        ],
    },

    // 7. GENERAL WEDDING GIFTS
    {
        id: 'c1000000-0000-0000-0000-000000000007',
        key: 'general-wedding-gifts',
        name: 'General Wedding Gifts',
        description: 'A simple gift checklist for principal sponsors, the Reverend, and supplier tokens.',
        category: 'wedding-day',
        supports_box_packing: false,
        sections: [
            {
                section_key: 'general',
                name: 'General',
                items: [
                    { item_key: 'gwg-sponsors', title: 'Gifts for principal sponsors', location: 'Gifts', due_offset_days: 14 },
                    { item_key: 'gwg-reverend', title: 'Gift for Reverend', location: 'Gifts', due_offset_days: 14 },
                    { item_key: 'gwg-suppliers', title: 'Small tokens for suppliers', location: 'Gifts', due_offset_days: 14 },
                ],
            },
        ],
    },
];

export function buildFallbackTemplateCards(additionsById?: Map<string, number>): ChecklistTemplate[] {
    return SEED_CHECKLIST_TEMPLATES.map((tmpl) => {
        const addedCount = additionsById?.get(tmpl.id) || additionsById?.get(tmpl.key) || 0;
        const itemCount = tmpl.sections.reduce((acc, sec) => acc + sec.items.length, 0);

        return {
            id: tmpl.id,
            key: tmpl.key,
            name: tmpl.name,
            description: tmpl.description,
            category: tmpl.category,
            supports_box_packing: tmpl.supports_box_packing,
            item_count: itemCount,
            section_count: tmpl.sections.length,
            already_added: addedCount > 0,
            added_count: addedCount,
        };
    });
}

export function buildFallbackTemplatePreview(templateIdOrKey: string, additionsById?: Map<string, number>): ChecklistTemplatePreview | null {
    const tmpl = SEED_CHECKLIST_TEMPLATES.find(
        (t) => t.id === templateIdOrKey || t.key === templateIdOrKey,
    );
    if (!tmpl) return null;

    const addedCount = additionsById?.get(tmpl.id) || additionsById?.get(tmpl.key) || 0;
    const itemCount = tmpl.sections.reduce((acc, sec) => acc + sec.items.length, 0);

    const template: ChecklistTemplate = {
        id: tmpl.id,
        key: tmpl.key,
        name: tmpl.name,
        description: tmpl.description,
        category: tmpl.category,
        supports_box_packing: tmpl.supports_box_packing,
        item_count: itemCount,
        section_count: tmpl.sections.length,
        already_added: addedCount > 0,
        added_count: addedCount,
    };

    let itemSortCounter = 1;
    const sections: ChecklistTemplateSection[] = tmpl.sections.map((sec, secIdx) => {
        const sectionId = `${tmpl.id}-s${secIdx + 1}`;
        const items: ChecklistTemplateItem[] = sec.items.map((item) => ({
            id: `${tmpl.id}-${item.item_key}`,
            template_id: tmpl.id,
            section_id: sectionId,
            item_key: item.item_key,
            title: item.title,
            description: item.description || '',
            notes: item.notes || null,
            is_optional: Boolean(item.is_optional),
            quantity: Number(item.quantity ?? 1),
            assigned_person: item.assigned_person || null,
            location: item.location || null,
            not_included: Boolean(item.not_included),
            due_offset_days: item.due_offset_days ?? null,
            sort_order: itemSortCounter++,
        }));

        return {
            id: sectionId,
            template_id: tmpl.id,
            section_key: sec.section_key,
            name: sec.name,
            sort_order: secIdx + 1,
            items,
        };
    });

    return { template, sections };
}
