import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(`${origin}/login`);
    }

    // ✅ IMPORTANT: await cookies()
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: any) {
                    cookieStore.set({ name, value: "", ...options });
                },
            },
        }
    );

    // 🔑 Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("Auth callback error:", error.message);
        return NextResponse.redirect(`${origin}/login`);
    }

    // 🔍 Fetch authenticated user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const role = user?.user_metadata?.role;

    // ✅ Redirect directly to dashboard
    if (role === "organization") {
        return NextResponse.redirect(`${origin}/organization`);
    }

    // default → worker
    return NextResponse.redirect(`${origin}/worker`);
}
