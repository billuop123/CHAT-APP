import { useEffect, useState } from "react";
import Appbar, { info } from "./Appbar";
import axios from "axios";
import LoginRequest from "./LoginRequest";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface Message {
  from: string;
  to: string;
  message: string;
}

export default function Chat() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messageObj, setMessageObj] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const username = info();
  const [to, setTo] = useState("");
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const navigate = useNavigate(); // Use navigate hook

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:3000");

    newSocket.onopen = () => {
      console.log("Connection established");
      setSocket(newSocket);
    };

    axios
      .get(`http://localhost:3000/api/v1/chat/${username}`)
      .then((response) => {
        console.log(response.data);
        setMessageObj(response.data.messages);
      });

    newSocket.onmessage = async (msg) => {
      const { from, message, to } = JSON.parse(msg.data);

      axios
        .post("http://localhost:3000/api/v1/chat/add", { to, from, message })
        .then((response) => {
          console.log(response.data);
        });

      if (to === username || from === username) {
        setMessageObj((prevMessages) => [
          ...prevMessages,
          { from, to, message },
        ]);
      }
    };

    setSocket(newSocket);
    return () => newSocket.close();
  }, [username]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;

      // Boundary check to keep the element within the screen
      const maxX = window.innerWidth - 200; // Adjust width based on the element's width
      const maxY = window.innerHeight - 100; // Adjust height based on the element's height

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!socket) return <div>Loading......</div>;
  if (sessionStorage.getItem("jwt") === "" || !sessionStorage.getItem("jwt")) {
    return <LoginRequest />;
  }
  if (messageObj.length === 0) return <h1>You have no History</h1>;
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <Appbar />
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          cursor: "move",
          padding: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
          width: "300px",
          zIndex: 10,
        }}
      >
        <input
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Enter your message"
          value={newMessage}
          className="p-3 rounded-md mb-4 w-full border border-gray-300"
        />
        <input
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient Username"
          value={to}
          className="p-3 rounded-md mb-4 w-full border border-gray-300"
        />
        <button
          onClick={() => {
            socket.send(
              JSON.stringify({ from: username, to, message: newMessage })
            );
            setTo("");
            setNewMessage("");
          }}
          className="bg-indigo-600 text-white py-3 px-4 rounded-md w-full font-semibold hover:bg-indigo-700 transition duration-300"
        >
          Send
        </button>
      </div>

      <div className="flex flex-col space-y-4 mt-24 p-6 max-w-2xl mx-auto">
        {messageObj.map((item, index) =>
          item.from === username ? (
            <div
              key={index}
              className="self-end bg-indigo-600 text-white px-5 py-3 rounded-lg max-w-xs shadow-lg"
            >
              {item.message}
            </div>
          ) : (
            <div
              key={index}
              className="self-start bg-gray-300 text-black px-5 py-3 rounded-lg max-w-xs shadow-lg"
            >
              <div className="mb-1 text-sm text-gray-600 font-medium">
                From {item.from}
              </div>
              <span>{item.message}</span>
            </div>
          )
        )}
      </div>

      {/* Go back button */}
      <button
        onClick={() => navigate(-1)}
        className="bg-red-500 text-white ml-4 py-3 px-6 rounded-md hover:bg-red-600 transition duration-300 mt-6 font-semibold"
      >
        Go Back
      </button>
    </div>
  );
}
