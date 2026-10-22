/** Costs are commitments regardless of whether money has already changed hands. */
export function calculatePlannerBudget(
  budgets: Array<{
    estimated_cost?: unknown;
    actual_cost?: unknown;
    is_paid?: boolean;
  }>,
  vendors: Array<{ amount?: unknown; payment_status?: string }>,
  foodDrinks: Array<{
    estimated_cost?: unknown;
    planner_vendor_id?: string | null;
  }>,
) {
  const amount = (value: unknown) => Math.max(0, Number(value) || 0);
  const budgetCommitted = budgets.reduce(
    (sum, item) =>
      sum + (amount(item.actual_cost) || amount(item.estimated_cost)),
    0,
  );
  const vendorCommitted = vendors.reduce(
    (sum, vendor) => sum + amount(vendor.amount),
    0,
  );
  const foodCommitted = foodDrinks
    .filter((item) => !item.planner_vendor_id)
    .reduce((sum, item) => sum + amount(item.estimated_cost), 0);
  const paid =
    budgets
      .filter((item) => item.is_paid)
      .reduce(
        (sum, item) =>
          sum + (amount(item.actual_cost) || amount(item.estimated_cost)),
        0,
      ) +
    vendors
      .filter((vendor) => vendor.payment_status?.toLowerCase() === "paid")
      .reduce((sum, vendor) => sum + amount(vendor.amount), 0);
  const committed = budgetCommitted + vendorCommitted + foodCommitted;
  return {
    committed,
    paid,
    outstanding: Math.max(0, committed - paid),
    budgetCommitted,
    vendorCommitted,
    foodCommitted,
  };
}

/** Installment payments belong to one cost; an overpayment cannot hide another cost. */
export function calculateInstallmentPaid(
  budgets: Array<{
    id: string;
    actual_cost?: unknown;
    estimated_cost?: unknown;
    is_paid?: boolean;
  }>,
  vendors: Array<{ id: string; amount?: unknown; payment_status?: string }>,
  milestones: Array<{
    planner_vendor_id?: string | null;
    planner_budget_id?: string | null;
    paid_at?: unknown;
    amount?: unknown;
  }>,
) {
  const positive = (value: unknown) =>
    Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const paid = new Map<string, number>();
  for (const item of milestones) {
    if (!item.paid_at) continue;
    const key = item.planner_vendor_id
      ? `vendor:${item.planner_vendor_id}`
      : `budget:${item.planner_budget_id}`;
    paid.set(key, (paid.get(key) || 0) + positive(item.amount));
  }
  return (
    vendors.reduce(
      (sum, item) =>
        sum +
        (item.payment_status?.toLowerCase() === "paid"
          ? 0
          : Math.min(
              positive(item.amount),
              paid.get(`vendor:${item.id}`) || 0,
            )),
      0,
    ) +
    budgets.reduce(
      (sum, item) =>
        sum +
        (item.is_paid
          ? 0
          : Math.min(
              positive(item.actual_cost) || positive(item.estimated_cost),
              paid.get(`budget:${item.id}`) || 0,
            )),
      0,
    )
  );
}
