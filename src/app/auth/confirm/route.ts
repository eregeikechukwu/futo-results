import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as any;

  console.log("1. token_hash:", token_hash);
  console.log("2. type:", type);

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
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type }); // could be "email" (student) or "invite" (advisor)

    console.log("3. verifyOtp error:", error);
    console.log("4. session exists:", !!data.session);
    console.log("5. user id:", data.session?.user?.id);
    console.log("6. user metadata:", data.session?.user?.user_metadata);

    if (error && !data.session) {
      return NextResponse.redirect(
        new URL("/student/auth?error=invalid_link", request.url),
      );
    }

    const user = data.session?.user;

    const regNumber = data.session?.user.user_metadata?.reg_number;

    console.log("7. regNumber from metadata:", regNumber);

    if (type === "invite" || type === "recovery") {
      // Both advisor first time and forgot password land here.
      //sessoin is active. redirect to appropriate set-password page

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

      // THis is for an advisor clicking an invite link
      if (profile?.role === "advisor") {
        return NextResponse.redirect(
          new URL("/advisor/set-password", request.url),
        );
      }

      // for students set passowrd
      return NextResponse.redirect(
        new URL('/student/set-password', request.url)
      )
    }


    /// This is the email confirmation flow for students. They land here after clicking the link in their email for the first time. We need to create their student row and mark preregistration as claimed, then redirect to dashboard
    if (regNumber) {
      // Fetch preregisyration data
      const { data: preReg, error: preRegError } = await supabase
        .from("student_preregistrations")
        .select("department_id, admission_year, id")
        .eq("reg_number", regNumber)
        .eq("claimed", false)
        .maybeSingle();

      console.log("8. preReg found:", preReg);
      console.log("9. preReg error:", preRegError);

      if (preReg) {
        // Create the students rw now that eail is confirmed
        const { error: insertError } = await supabase.from("students").insert({
          reg_number: regNumber,
          department_id: preReg.department_id,
          admission_year: preReg.admission_year,
          status: "pending",
          profile_id: data.session?.user.id,
        });

        console.log("10. student insert error:", insertError);

        // Mark preregistration as claimed
        // Temporary test — use service role client just for this update
        // const { error: claimError } = await supabase
        //   .from("student_preregistrations")
        //   .update({ claimed: true })
        //   .eq("id", preReg.id);
        // // .eq("claimed", false);

        // const {
        //   data: { user: currentUser },
        // } = await supabase.auth.getUser();
        // console.log("11b. auth.uid() at update time:", currentUser?.id);

        const adminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );

        const { error: claimError } = await adminClient
          .from("student_preregistrations")
          .update({ claimed: true })
          .eq("id", preReg.id);

        console.log("11. claimed update error:", claimError);
      }
    }

    console.log("12. redirecting to dashboard");
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }
}
