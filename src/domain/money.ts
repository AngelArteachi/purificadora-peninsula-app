const MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const MXN_SHORT = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** `128` → `$128.00`. Use for totals, line prices and anything the user pays. */
export function formatMoney(amount: number) {
  return MXN.format(amount);
}

/** `10` → `$10`, `10.5` → `$10.5`. Use in compact meta copy ("envío $10"). */
export function formatMoneyShort(amount: number) {
  return MXN_SHORT.format(amount);
}
