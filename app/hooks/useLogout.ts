import { useRouter } from "next/navigation";

export const useLogout = () => {
    const router = useRouter();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
    };

    return logout;
};
