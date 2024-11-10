import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  function handleClickLogin() {
    navigate("/login");
  }
  function handleClickSignup() {
    navigate("/signup");
  }
  return (
    <div className="flex h-screen justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg w-96">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to ChatApp
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Stay connected with your friends and family.
        </p>

        <div className="space-y-4">
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
            onClick={handleClickLogin}
          >
            Login
          </button>

          <button
            className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-300"
            onClick={handleClickSignup}
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}
