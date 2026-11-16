import { signOut } from "@/app/actions/sign-out";
import { primaryButtonClassName } from "@/components/styles";
import { requireRole, type Role } from "@/lib/auth";

export async function RolePanel({ role }: { role: Role }) {
  const result = await requireRole(role);

  if (result.status === "missing") {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-6">
        <p>We could not find your profile.</p>
        <form action={signOut}>
          <button type="submit" className={primaryButtonClassName}>
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-navy/10 bg-white p-6">
      <p>Signed in as {result.profile.full_name}.</p>
      <p className="text-sm text-muted">Your role is {result.profile.role}.</p>
    </div>
  );
}
