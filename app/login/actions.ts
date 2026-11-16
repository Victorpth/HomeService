"use server";

import { redirect } from "next/navigation";

import { isRole, roleHome } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { readText, validateCredentials, type FieldErrors } from "@/lib/validation";

export type LoginState = {
  message?: string;
  fieldErrors?: FieldErrors;
};

export async function login(
  _state: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const validated = validateCredentials({
    email: readText(formData, "email"),
    password: readText(formData, "password"),
  });

  if (Object.keys(validated.fieldErrors).length > 0) {
    return { fieldErrors: validated.fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { message: "Confirm your email before you log in." };
    }

    if (error.code === "invalid_credentials") {
      return { message: "Email or password is incorrect." };
    }

    return { message: "Could not log in. Try again." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile || !isRole(profile.role)) {
    return { message: "We could not find your profile." };
  }

  redirect(roleHome(profile.role));
}
