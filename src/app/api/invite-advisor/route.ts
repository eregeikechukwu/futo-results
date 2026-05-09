import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, title, departmentId, admissionYear } =
      await request.json();

    // Admin client = needs service role to create users + bypass RLS
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // STep1: Send the invite via Supabase Admin API
    // THIS creates the auth.users row AND sends the email invite
    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
          role: "advisor",
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      });

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }
    const userId = inviteData.user.id;

    // Step 2: CReate the advisor profile in our database with correct role
    // Do this before thecy click the link - no race condition
    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      email,
      role: "advisor",
    });

    if (profileError) {
      return NextResponse.json(
        {
          error:
            "Invite sent but failed to create profile: " + profileError.message,
        },
        { status: 500 },
      );
    }

    // Step 3: Create the advisors row
    const { data: advisorRow, error: advisorError } = await adminClient
      .from("advisors")
      .insert({
        profile_id: userId,
        title,
      })
      .select("id")
      .single();

    if (advisorError) {
      return NextResponse.json(
        {
          error:
            "Profile created but advisors row failed:" + advisorError.message,
        },
        { status: 500 },
      );
    }

    // Step 4: Create the advisor_aassignments row --
    const { error: assignmentError } = await adminClient
      .from("advisor_assignments")
      .insert({
        advisor_id: advisorRow.id,
        department_id: departmentId,
        admission_year: admissionYear,
      });

    if (assignmentError) {
      return NextResponse.json(
        {
          error:
            "Advisor created but assignment failed:" + assignmentError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invite sent to ${email}`,
    });
  } catch (err) {
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
