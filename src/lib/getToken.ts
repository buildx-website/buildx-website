export async function GetToken() {
    try {
        const res = await fetch("/api/auth/token");
        if (!res.ok) {
            return null;
        }
        const data = await res.json();
        return data.token;
    } catch (error) {
        console.error("Error fetching token:", error);
        return null;
    }
}