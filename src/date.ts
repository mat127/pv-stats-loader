export function getDateString(date: Date): string {
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  return `${date.getFullYear()}-${month.toString().padStart(2, '0')}-${dayOfMonth.toString().padStart(2, '0')}`;
}

export function plusHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours*60*60*1000);
}

export function truncateToDate(date: Date) {
  const truncated = new Date(date);
  truncated.setHours(0, 0, 0, 0);
  return truncated;
}

export function yesterday(): Date {
  return plusHours(new Date(), -24);
}
