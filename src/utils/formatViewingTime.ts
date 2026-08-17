const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatViewingDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

export function formatViewingTime(time: string): string {
  const [hoursRaw, minutes] = time.split(":");
  const hours = Number(hoursRaw);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = ((hours + 11) % 12) + 1;
  return `${displayHours}:${minutes} ${period}`;
}
