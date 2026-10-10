export const money = (n?: number | null) =>
  typeof n === 'number' ? `RM ${n.toLocaleString('en-MY', { maximumFractionDigits: 0 })}` : 'Price not set';
export const km = (n?: number | null) =>
  typeof n === 'number' ? `${n.toLocaleString('en-MY')} km` : 'Mileage not set';
