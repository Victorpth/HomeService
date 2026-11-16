import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

const otpTypes: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function isOtpType(value: string | null): value is EmailOtpType {
  return otpTypes.some((type) => type === value);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const authError = searchParams.get("error");

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.search = "";

  if (authError || (!code && !(tokenHash && isOtpType(type)))) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "confirm");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        type: type as EmailOtpType,
        token_hash: tokenHash ?? "",
      });

  if (error) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "confirm");
    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.pathname = "/host";
  return NextResponse.redirect(redirectUrl);
}
