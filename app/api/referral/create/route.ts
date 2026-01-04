import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            referrer_id,
            job_id,
            email,
            password,
            name,
            phone,
            age,
            skills,
            location,
            experience,
        } = body;

        // 1. Init Supabase Admin
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. Create User
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for referral? Or false if they need to verify.
            user_metadata: {
                full_name: name,
                phone: phone,
                role: "worker",
            },
        });

        if (userError) {
            return NextResponse.json({ error: userError.message }, { status: 400 });
        }

        const newUserId = userData.user.id;

        // 3. Create Worker Profile
        // NOTE: 'age' might need to be number. skills is string (comma sep) or array?
        // Based on Modal it was string, then split.
        const skillsArray = typeof skills === "string" ? skills.split(",").map((s: string) => s.trim()) : skills;

        const { error: workerError } = await supabaseAdmin.from("workers").insert({
            user_id: newUserId,
            name,
            email,
            phone,
            age: Number(age),
            skills: skillsArray,
            location,
            experience,
        });

        if (workerError) {
            // Rollback user creation? Hard with Supabase. Just return error for now.
            return NextResponse.json({ error: "Failed to create worker profile: " + workerError.message }, { status: 500 });
        }

        // 4. Create Job Application
        const { error: appError } = await supabaseAdmin.from("job_applications").insert({
            job_id: job_id,
            worker_id: newUserId,
            status: "pending",
        });

        if (appError) {
            return NextResponse.json({ error: "Failed to apply for job: " + appError.message }, { status: 500 });
        }

        // 5. Create Referral Record
        // Check if 'referrals' table has 'referred_user_id' or we just store metadata?
        // Using existing schema from Modal: partner_id, job_id, candidate_name...
        const { error: referralError } = await supabaseAdmin.from("referrals").insert({
            partner_id: referrer_id,
            job_id: job_id,
            status: "pending",
            candidate_name: name,
            candidate_phone: phone,
            // Store the new user ID if possible? If column exists.
            // If not, we just store the metadata as before.
            candidate_details: {
                age,
                skills: skillsArray,
                location,
                experience,
                email, // Add email to details
                generated_user_id: newUserId // Store this for reference!
            }
        });

        if (referralError) {
            return NextResponse.json({ error: "Failed to create referral record: " + referralError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, userId: newUserId });

    } catch (err: any) {
        console.error("Referral API Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
