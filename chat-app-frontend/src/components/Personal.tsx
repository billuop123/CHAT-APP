import { useParams } from "react-router-dom";
import { info } from "./Appbar";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

interface Message {
  from: string;
  to: string;
  message: string;
}

export default function Personal() {
  const username = info();
  const { username1, username2 } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:3000");

    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      setSocket(newSocket);
    };

    axios
      .post("http://localhost:3000/api/v1/chat/personal", {
        username1,
        username2,
      })
      .then((response) => setMessages(response.data.messages))
      .catch((error) => console.error("Error fetching messages:", error));

    newSocket.onmessage = (msg) => {
      const { from, message, to } = JSON.parse(msg.data);
      axios
        .post("http://localhost:3000/api/v1/chat/add", { to, from, message })
        .then((response) => {
          console.log(response.data);
        });
      if (
        (to === username1 && from === username2) ||
        (to === username2 && from === username1)
      ) {
        setMessages((prevMessages) => [...prevMessages, { from, to, message }]);
      }
    };

    return () => {
      newSocket.close();
    };
  }, [username1, username2, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    setIsSending(true);

    const messageData = {
      from: username,
      to: username2 as string,
      message: newMessage,
    };

    socket.send(JSON.stringify(messageData));

    setNewMessage("");
    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="text-xl text-center mb-4 font-semibold text-gray-800">
          Chat with {username2}
        </h1>
        <div className="space-y-4">
          {messages.map((item, index) => (
            <div
              key={index}
              className={`flex ${
                item.from === username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg text-base ${
                  item.from === username
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {item.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 bg-white shadow-md flex items-center">
        <input
          type="text"
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={isSending || !newMessage.trim()}
          className={`ml-4 px-4 py-2 font-semibold rounded-lg 
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
}
