import { jwtDecode } from "jwt-decode";

// Define the type for the JWT payload
interface JwtPayload {
  username?: string;
}

export function info() {
  const token = sessionStorage.getItem("jwt");

  if (!token) {
    console.warn("Token not found in sessionStorage");
    return null;
  }

  try {
    // Decode the token with the custom JwtPayload type
    const { username } = jwtDecode<JwtPayload>(token);

    return username ?? "Guest"; // Fallback if username is not present
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export default function Appbar() {
  const username = info();

  return <div>Welcome back, {username}</div>;
}
