import { jwtDecode } from "jwt-decode";

export function info() {
  const token = sessionStorage.getItem("jwt");

  if (!token) {
    console.warn("Token not found in cookies");
    return null;
  }

  try {
    const { username } = jwtDecode(token);

    return username;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export default function Appbar() {
  const username = info();

  return <div>Welcome back {username}</div>;
}
