"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { readText, validateCredentials, type FieldErrors } from "@/lib/validation";

export type SignupState = {
  message?: string;
  fieldErrors?: FieldErrors;
};

export async function signup(
  _state: SignupState | null,
  formData: FormData,
): Promise<SignupState> {
  const validated = validateCredentials({
    fullName: readText(formData, "fullName"),
    email: readText(formData, "email"),
    password: readText(formData, "password"),
  });

  if (Object.keys(validated.fieldErrors).length > 0) {
    return { fieldErrors: validated.fieldErrors };
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: { full_name: validated.fullName },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    if (error.code === "email_address_invalid") {
      return { fieldErrors: { email: "Enter a valid email address." } };
    }

    if (error.code === "weak_password") {
      return {
        fieldErrors: { password: "Choose a stronger password." },
      };
    }

    if (error.code === "over_email_send_rate_limit") {
      return {
        message: "We could not send the confirmation email right now. Try again in a few minutes.",
      };
    }

    return { message: "Could not create the account. Try again." };
  }

  if (data.session) {
    redirect("/host");
  }

  return {
    message: "Check your email to confirm your account. If you already have an account, log in.",
  };
}
