/** Today's date (YYYY-MM-DD) in the tristate's time zone, so an event stays listed all through its day. */
export function localToday(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
}
