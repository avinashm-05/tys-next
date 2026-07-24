/**
 * Port of Str::slug as used by the Service `creating` hook (Service.php:42-49,
 * R11): lowercase, runs of anything outside [a-z0-9_] collapse to "-",
 * trimmed. Result always matches the system_name charset ^[a-z0-9\-_]+$.
 */
export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "service"
  );
}
