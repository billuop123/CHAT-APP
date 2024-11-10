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
  return (
    <div>
      <Appbar />
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          position: "fixed", // Changed to fixed positioning
          top: position.y,
          left: position.x,
          cursor: "move",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <input
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message"
          value={newMessage}
          className="p-2 rounded-md mb-2 w-full"
        />
        <input
          onChange={(e) => setTo(e.target.value)}
          placeholder="To (username)"
          value={to}
          className="p-2 rounded-md mb-2 w-full"
        />
        <button
          onClick={() => {
            socket.send(
              JSON.stringify({ from: username, to, message: newMessage })
            );
            setTo("");
            setNewMessage("");
          }}
          className="bg-blue-500 text-white py-2 px-4 rounded-md w-full"
        >
          Send
        </button>
      </div>

      <div className="flex flex-col space-y-2 mt-16 p-4 max-w-2xl mx-auto">
        {messageObj.map((item, index) =>
          item.from === username ? (
            <div
              key={index}
              className="self-end bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs"
            >
              {item.message}
            </div>
          ) : (
            <div
              key={index}
              className="self-start bg-gray-300 text-black px-4 py-2 rounded-lg max-w-xs"
            >
              <div className="mt-4 mb-2">
                <span className="bg-slate-100 rounded-full p-2 ">
                  From {item.from}
                </span>
              </div>
              <span>{item.message}</span>
            </div>
          )
        )}
      </div>

      {/* Go back button */}
      <button
        onClick={() => navigate(-1)}
        className="bg-red-500 text-white ml-40 py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 mt-4"
      >
        Go Back
      </button>
    </div>
  );
}
