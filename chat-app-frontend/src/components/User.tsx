import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Appbar, { info } from "./Appbar";
import LoginRequest from "./LoginRequest";
import toast from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const username = info();

  function handleLogout() {
    sessionStorage.setItem("jwt", "");
    toast.success("successfully logged out");
    navigate("/");
  }

  useEffect(() => {
    axios.get("http://localhost:3000/api/v1/user/all").then((response) => {
      setUsers(response.data.allUsers);
    });
  }, []);
  if (sessionStorage.getItem("jwt") === "" || !sessionStorage.getItem("jwt")) {
    return <LoginRequest />;
  }
  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-6 bg-gray-100 animate-slide-in">
      <Appbar />
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Click on a user to start messaging
      </h1>

      <div className="overflow-y-auto w-full max-w-md">
        {users.map((user) => (
          <div
            key={user.username}
            className="bg-blue-500 text-white text-center font-medium py-2 px-4 mb-3 rounded-lg shadow hover:bg-blue-600 transition-colors duration-200"
          >
            <Link to={`/${username}/${user.username}`} className="block">
              {user.username}
            </Link>
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 w-full max-w-md px-6">
        <button
          onClick={() => navigate("/chat")}
          className="w-full py-3 font-semibold text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 transition-colors duration-200 focus:outline-none"
        >
          See your chat history
        </button>
      </div>

      {/* Logout Button positioned at top right */}
      <button
        onClick={handleLogout}
        className="absolute top-20 right-6 py-2 px-4 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition-colors duration-200 focus:outline-none"
      >
        Logout
      </button>
    </div>
  );
}
