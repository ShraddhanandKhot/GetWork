import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return request.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name, options) {
                    response.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                },
            },
        }
    );

    // 🔥 THIS IS THE MOST IMPORTANT LINE
    await supabase.auth.getSession();

    return response;
}
