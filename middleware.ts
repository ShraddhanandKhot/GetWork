import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
    let res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => req.cookies.get(name)?.value,
                set: (name, value, options) => {
                    res.cookies.set({ name, value, ...options });
                },
                remove: (name, options) => {
                    res.cookies.set({ name, value: "", ...options });
                },
            },
        }
    );

    // 🔑 THIS LINE IS THE MAGIC
    await supabase.auth.getSession();

    return res;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
