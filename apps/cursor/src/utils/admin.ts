export function getAdminIds(): string[] {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdmin(userId: string): boolean {
  return getAdminIds().includes(userId);
}
