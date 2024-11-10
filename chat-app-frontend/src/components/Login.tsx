import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner"; // Ensure Spinner is imported
import { toast } from "react-hot-toast"; // Import toast properly

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    axios
      .post(
        "http://localhost:3000/api/v1/user/signin",
        { username, password },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.msg === "successfully logged in ") {
          sessionStorage.setItem("jwt", response.data.token);
          navigate("/users");
          toast.success("Logged in successfully");
        } else {
          console.error("Login failed:", response.data.msg); // Log specific failure message
          toast.error(response.data.msg || "Login failed");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Credentials do not match");
      })
      .finally(() => setIsLoading(false)); // Reset loading state regardless of outcome
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center text-gray-700">
            Login
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-600"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
            >
              Log In
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
