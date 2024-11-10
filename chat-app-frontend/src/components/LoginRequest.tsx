import { Link } from "react-router-dom";

export default function LoginRequest() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Please Login
        </h1>
        <p className="text-gray-600 mb-6">
          You need to log in to access this page.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
