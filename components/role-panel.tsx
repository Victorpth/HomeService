import { signOut } from "@/app/actions/sign-out";
import { requireRole, type Role } from "@/lib/auth";

export async function RolePanel({ role }: { role: Role }) {
  const result = await requireRole(role);

  if (result.status === "missing") {
    return (
      <div className="flex flex-col gap-4">
        <p>We could not find your profile.</p>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p>Signed in as {result.profile.full_name}.</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Your role is {result.profile.role}.
        </p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
