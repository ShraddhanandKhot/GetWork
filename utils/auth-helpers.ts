import { createClient } from "@/utils/supabase/client";

/**
 * Performs a hard logout by signing out of Supabase and forcing a full page reload
 * to the login page. This clears all application state and prevents "stuck" UI.
 */
export async function hardLogout() {
    try {
        const supabase = createClient();
        await supabase.auth.signOut();
    } catch (error) {
        console.error("Supabase signOut failed (ignoring to force redirect):", error);
    } finally {
        // Force hard redirect to clear memory/context
        window.location.href = "/login";
    }
}
