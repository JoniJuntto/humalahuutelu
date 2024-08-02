"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://humalahuutelu-api.onrender.com");

export type ChatMessage = {
  sender: string;
  message: string;
  timestamp: Date;
};

enum User {
  OWN = "OWN",
  OTHER = "OTHER"
}

const badWords = [
  "vittu",
  "perse",
  "paska",
  "saatana",
  "helvetti",
  "kulli",
  "kusipää",
  "mulkku",
  "pillu",
  "homo",
  "huora",
  "vitun",
  "neekeri",
  "horonaama",
  "perkele",
  "kyrpä",
  "ääliö",
  "idiootti",
  "piru",
  "runkkari"
];

const moderateMessage = (message: string): string => {
  let moderatedMessage = message;
  badWords.forEach((badWord) => {
    const regex = new RegExp(badWord, "gi");
    moderatedMessage = moderatedMessage.replace(regex, "höpö");
  });
  return moderatedMessage;
};

const ChatComponent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [latestMessage, setLatestMessage] = useState<string>("");

  useEffect(() => {
    socket.on("message", (msg: string) => {
      const moderatedMsg = moderateMessage(msg);
      const message = {
        sender: msg === latestMessage ? User.OWN : User.OTHER,
        message: moderatedMsg,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("message");
    };
  }, [latestMessage]);

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const moderatedMessage = moderateMessage(currentMessage);
      setLatestMessage(moderatedMessage);
      socket.emit("message", moderatedMessage);
      setCurrentMessage("");
    }
  };

  return (
    <div className="p-12 max-w-[600px]">
      <h4>Chat</h4>
      <ScrollArea
        style={{
          height: "300px",
          border: "1px solid #ddd",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        {messages.map((message: ChatMessage, index: number) => (
          <div 
            key={index} 
            className={`flex mb-2 ${message.sender === User.OWN ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`p-2 w-1/2 ${message.sender === User.OWN ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <p className="text-black">{message.message}</p>
            </Card>
          </div>
        ))}
      </ScrollArea>
      <div style={{ display: "flex", marginTop: "10px" }}>
        <Textarea
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type your message here..."
          style={{ flexGrow: 1, marginRight: "10px" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage} color="primary">
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
