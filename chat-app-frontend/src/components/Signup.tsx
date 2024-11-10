import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    axios
      .post(
        "http://localhost:3000/api/v1/user/signup",
        { username, password },
        { withCredentials: true } // Include cookies in request
      )
      .then((response) => {
        const newStatus = response.data.status; // Capture status directly from response
        setStatus(newStatus);
        setIsLoading(false);
        if (newStatus === "success") {
          sessionStorage.setItem("jwt", response.data.token);
          navigate("/users");
        }
        if (response.data.error) {
          setError(response.data.error);
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  // Trigger toast error if there's an error
  if (error) {
    toast.error(error);
    setError(""); // Clear error after displaying the toast
  }

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex h-screen items-center justify-center bg-gray-100">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center text-gray-700">
              Sign Up
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
                Sign Up
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
