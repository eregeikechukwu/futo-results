import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as any;

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    // Exchange the token for a session
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (error && !data.session) {
      return NextResponse.redirect(
        new URL("/student/auth?error=invalid_link", request.url),
      );
    }

    const regNumber = data.session?.user.user_metadata?.reg_number;

    if (regNumber) {
      // Fetch preregisyration data
      const { data: preReg } = await supabase
        .from("student_preregistrations")
        .select("department_id, admission_year, id")
        .eq("reg_number", regNumber)
        .eq("claimed", false)
        .maybeSingle();

      if (preReg) {
        // Create the students rw now that eail is confirmed
        await supabase.from("students").insert({
          reg_number: regNumber,
          department_id: preReg.department_id,
          admission_year: preReg.admission_year,
          status: "pending",
          profile_id: data.session?.user.id,
        });

        // Mark preregistration as claimed
        await supabase
          .from("student_preregistrations")
          .update({ claimed: true })
          .eq("id", preReg.id);
      }
    }

    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }
}
