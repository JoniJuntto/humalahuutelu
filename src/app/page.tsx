"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
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

  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const moderatedMessage = moderateMessage(currentMessage);
      setLatestMessage(moderatedMessage);
      socket.emit("message", moderatedMessage);
      setCurrentMessage("");
    }
  };

  return (
    <div className="w-full p-4 max-w-md mx-auto items-center justify-center flex flex-col">
      <h1 className="text-2xl font-bold self-center mb-4">Humalahuutelu</h1>
      <ScrollArea
        className="w-full h-96 border border-[#ddd] rounded-md p-4 overflow-y-auto mb-4"
      >
        {messages.map((message: ChatMessage, index: number) => (
          <div
            key={index}
            className={`flex mb-2 ${message.sender === User.OWN ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`p-2 max-w-xs ${message.sender === User.OWN ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <p className="text-black break-words">{message.message}</p>
            </Card>
          </div>
        ))}
        <div ref={scrollRef} />
      </ScrollArea>
      <Textarea
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        placeholder="Type your message here..."
        className="w-full"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />
      <Button onClick={handleSendMessage} className="w-full mt-4">
        Send
      </Button> 
      <p>Tässä palvelussa viestit eivät tallennu, sinulla ei ole käyttäjää, etkä voi tietää kuka on viestin lähettänyt. Käyttö omalla vastuulla</p>
    </div>
  );
};

export default ChatComponent;
