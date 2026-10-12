import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../lib/supabase";

const createSlug = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");

export async function POST(request) {
  try {
    const token = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    }

    const database = createServerSupabaseClient();
    const { data: authData, error: authError } = await database.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Your session is invalid or expired" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await database
      .from("users")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access is required" }, { status: 403 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON body is required" },
        { status: 400 }
      );
    }

    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    const description =
      typeof payload?.description === "string"
        ? payload.description.trim()
        : "";
    const slug = createSlug(name);

    if (!name || name.length > 80 || !slug) {
      return NextResponse.json(
        { error: "Enter a category name between 1 and 80 characters" },
        { status: 400 }
      );
    }
    if (description.length > 500) {
      return NextResponse.json(
        { error: "Category descriptions must be 500 characters or less" },
        { status: 400 }
      );
    }

    const { data: existingCategory, error: lookupError } = await database
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existingCategory) {
      if (
        existingCategory.name.toLowerCase() === name.toLowerCase() &&
        existingCategory.is_active
      ) {
        return NextResponse.json({ category: existingCategory, created: false });
      }
      if (existingCategory.name.toLowerCase() === name.toLowerCase()) {
        return NextResponse.json(
          { error: "This category already exists but is inactive" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "A different category already uses this name's URL slug" },
        { status: 409 }
      );
    }

    const { data: category, error: insertError } = await database
      .from("categories")
      .insert({
        name,
        slug,
        description: description || null,
        sort_order: 0,
        is_active: true,
      })
      .select("*")
      .single();
    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 409 }
        );
      }
      throw insertError;
    }

    return NextResponse.json({ category, created: true }, { status: 201 });
  } catch (error) {
    console.error("Admin category creation failed:", error.message);
    return NextResponse.json(
      { error: "Unable to create the category. Please try again." },
      { status: 500 }
    );
  }
}
