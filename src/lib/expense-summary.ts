type Vendor = { id: string; amount?: number | string; payment_status?: string; paid_amount?: number | null };
type Expense = { planner_vendor_id?: string | null; estimated_cost?: number | string; actual_cost?: number | string; is_paid?: boolean };
const money = (value: unknown) => Math.max(0, Number(value) || 0);

export function vendorBalance(vendor: Vendor) {
    const total = money(vendor.amount);
    const paid = vendor.paid_amount != null ? money(vendor.paid_amount)
        : vendor.payment_status?.toLowerCase() === 'paid' ? total
        : vendor.payment_status?.toLowerCase() === 'unpaid' ? 0 : null;
    return { paid, balance: paid === null ? null : Math.max(0, total - paid) };
}

export function expenseSummary(budgets: Expense[], vendors: Vendor[], food: Expense[] = []) {
    const linked = new Set(vendors.map(vendor => vendor.id));
    const independent = [...budgets, ...food].filter(item => !item.planner_vendor_id || !linked.has(item.planner_vendor_id));
    const planned = independent.reduce((sum, item) => sum + money(item.actual_cost || item.estimated_cost), 0)
        + vendors.reduce((sum, vendor) => sum + money(vendor.amount), 0);
    const paid = independent.reduce((sum, item) => sum + (item.is_paid ? money(item.actual_cost) : 0), 0)
        + vendors.reduce((sum, vendor) => sum + (vendorBalance(vendor).paid || 0), 0);
    return { planned, paid, unknownPayments: vendors.filter(vendor => vendorBalance(vendor).paid === null).length };
}
