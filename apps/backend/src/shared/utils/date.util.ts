export function toISOString(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

export function diffInSeconds(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 1000);
}

export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}