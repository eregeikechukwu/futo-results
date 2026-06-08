"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatTest() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const connected = useRef<boolean>(false);
  const [chat, setChat] = useState<{ from: string; message: string }[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const ws = new WebSocket("wss://ws.postman-echo.com/raw");

    ws.onopen = () => {
      connected.current = true;
      console.log("✅ Connected to WebSocket");
    }; //Indicates web socket handshake

    ws.onmessage = (event) => {
      console.log("📩 Message received:", event.data);
      setChat((prev) => [...prev, { message: event.data, from: "server" }]);
    }; //Indicates/shows receiving of message from server

    ws.onerror = (error) => {
      console.error("❌ Error occurred:", error);
    }; //Indicates error in web socket

    ws.onclose = () => {
      connected.current = false;
      console.log("🔌 Disconnected from WebSocket");
    };

    setSocket(ws);

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    if (socket && message.trim() !== "") {
      socket.send(message);
      setChat((prev) => [...prev, { message: message, from: "client" }]);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const Message = ({
    children,
    from,
  }: {
    children: React.ReactNode;
    from: string;
  }) => {
    return (
      <div
        className={` py-12 px-14 max-w-[60%] break-words  rounded-[24px] text-white ${
          from === "client"
            ? "!ml-auto self-left rounded-tr-none bg-[var(--color-primary)] "
            : "!mr-auto self-right rounded-tl-none bg-[#333159]"
        }`}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="relative bg-[url(/images/hero-option2.jpg)] !h-[calc(100vh-130px)] rounded-3xl bg-cover bg-no-repeat bg-center max-w-[99%]">
      <div className="z-0 absolute inset-0 opacity-70 bg-[var(--color-background-secondary)]"></div>
      {/* <!-- overlay with opacity --> */}
      <div className="h-[calc(100vh-178px)] overflow-auto [scrolbar-width:none] [&::-webkit-scrollbar]:hidden ">
        <div className="relative z-20 flex flex-col gap-14 w-full mb-10 [scrolbar-width:none] [&::-webkit-scrollbar]:hidden overflow-scroll ">
          {chat.map((message, i) => (
            <Message key={i} from={message.from}>
              {message.message}
            </Message>
          ))}
        </div>
      </div>

      <p
        className={`${
          connected.current ? "text-green-400" : "text-red-400"
        } absolute right-10 -top-8 z-30`}
      >
        <span
          className={`${
            connected.current ? "bg-green-400 animate-pulse" : " bg-red-400"
          } rounded-full mr-6 `}
        >
          &nbsp;
        </span>
        {connected.current ? "Connected" : "Disconnected"}
      </p>
      <div className="absolute flex rounded-full gap-15 w-full h-40 bottom-0 right-0 overflow-auto border-[var(--color-border-light)] border-solid border-[1px] p-3 ">
        <input
          type="text"
          value={message}
          placeholder="Message"
          className="flex-1 px-20 bg-[var(--color-background-secondary)] rounded-full text-[13px] border-none outline:none focus:outline-2 transition focus:outline-[var(--color-primary)]"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="rounded-full border-[var(--color-border-light)] border-solid border-[1px] font-bold hover:bg-blue-700 active:bg-blue-400 transition bg-[var(--color-primary)] group text-[var(--color-white)] center-child px-20"
          onClick={sendMessage}
        >
          <Send size={20} className="group-hover:scale-[1.1] transition" />
        </button>
      </div>
    </div>
  );
}
