import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

const token = Cookies.get("jwt") || "";

export default function useInfo() {
  const decodedToken = jwt.decode(token);
  if (decodedToken) {
    const decoded = decodedToken;
    console.log(decoded);
    return 1;
  }
  return null;
}
