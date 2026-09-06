import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Create user via Supabase Admin API
    // This bypasses email confirmation requirements
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("User creation failed:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // The database trigger will automatically create a profiles row
    // Return the user ID for client-side reference
    return NextResponse.json({ userId: data.user.id });
  } catch (error) {
    console.error("Account creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
