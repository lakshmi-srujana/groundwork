import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This runs server-side only — service role key bypasses ALL RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, role, full_name, district, ward, aapda_mitra_id } = body;

    if (!id || !role || !full_name || !district) {
      return NextResponse.json(
        { error: "Missing required fields: id, role, full_name, district" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id,
        role,
        full_name,
        district,
        ward: ward ?? null,
        aapda_mitra_id: aapda_mitra_id ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("[create-profile] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (err: any) {
    console.error("[create-profile] Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
