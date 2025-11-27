"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();
    const [role, setRole] = useState("worker");
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState("");

    // Worker fields
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [skills, setSkills] = useState("");
    const [location, setLocation] = useState("");
    const [expectedSalary, setExpectedSalary] = useState("");
    const [availability, setAvailability] = useState("");

    // Org fields
    const [email, setEmail] = useState(""); // Optional override

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            router.push("/login");
        } else {
            setToken(storedToken);
        }
    }, [router]);

    const handleProfileCreation = async () => {
        if (!name || !location) {
            alert("Name and Location are required");
            return;
        }

        setLoading(true);
        try {
            const body = role === "worker" ? {
                role: "worker",
                name,
                age: Number(age),
                skills: skills.split(",").map(s => s.trim()),
                location,
                expectedSalary,
                availability
            } : {
                role: "organization",
                name,
                location,
                email
            };

            const res = await fetch("https://getwork-backend.onrender.com/api/auth/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (data.success) {
                alert("Profile created successfully!");
                // Update user in local storage
                localStorage.setItem("user", JSON.stringify(data.user));

                if (role === "worker") {
                    router.push("/worker");
                } else {
                    router.push("/organization");
                }
            } else {
                alert(data.message || "Profile creation failed");
            }
        } catch (err) {
            alert("Server not reachable");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
                <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
                    Complete Your Profile
                </h2>

                <div className="flex gap-3 mb-6">
                    <button
                        className={`flex-1 py-2 rounded-lg ${role === "worker"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                        onClick={() => setRole("worker")}
                    >
                        Worker
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-lg ${role === "organization"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                        onClick={() => setRole("organization")}
                    >
                        Organization
                    </button>
                </div>

                {role === "worker" && (
                    <>
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Age"
                            className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Skills (comma separated)"
                            className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Expected Salary"
                            className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
                            value={expectedSalary}
                            onChange={(e) => setExpectedSalary(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Availability"
                            className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                        />
                    </>
                )}

                {role === "organization" && (
                    <>
                        <input
                            type="text"
                            placeholder="Organization Name"
                            className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Organization Email (Optional)"
                            className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </>
                )}

                <button
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                    onClick={handleProfileCreation}
                    disabled={loading}
                >
                    {loading ? "Creating Profile..." : "Complete Profile"}
                </button>
            </div>
        </div>
    );
}
