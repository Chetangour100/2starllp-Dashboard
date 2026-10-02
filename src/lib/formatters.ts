export function formatCurrency(
  amount: number
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(
  amount: number
): string {
  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  if (amount >= 10000000) {
    const crores =
      amount / 10000000;

    return `₹${crores % 1 === 0
      ? crores
      : crores.toFixed(1)}Cr`;
  }

  if (amount >= 100000) {
    const lakhs =
      amount / 100000;

    return `₹${lakhs % 1 === 0
      ? lakhs
      : lakhs.toFixed(1)}L`;
  }

  if (amount >= 1000) {
    const thousands =
      amount / 1000;

    return `₹${thousands % 1 === 0
      ? thousands
      : thousands.toFixed(1)}K`;
  }

  return formatCurrency(amount);
}

export function formatDate(
  dateStr: string | null | undefined
): string {
  if (!dateStr) {
    return "Not scheduled";
  }

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}