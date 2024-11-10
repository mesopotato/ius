// components/ChatArea.tsx

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Plus, Info, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Message } from "@/app/types/types";

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export default function ChatArea({ messages, onSendMessage }: ChatAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (process.env.NODE_ENV === 'development') {
      console.log("scrolling to bottom");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-150px)] bg-sky-100 rounded-xl shadow-lg mr-4 p-4 border border-teal-600">
      {/* Messages area */}
      <ScrollArea className="flex-1 overflow-y-auto border-0 shadow-md ">
        <div className="flex-1 overflow-y-auto border-0 bg-sky-100">
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-end pr-4"
                    : "justify-start pl-4"
                }`}
              >
                <div
                  ref={messagesEndRef}
                  className={`p-2 rounded-lg max-w-[90%] ${
                    message.sender === "user"
                      ? "bg-teal-600 text-white"
                      : "bg-sky-200 text-black"
                  }`}
                >
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {/* Empty div that we scroll into view */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Input area and buttons */}
      <div className="flex-shrink-0 mt-4">
        <div className="flex items-center">
          <Input
            className="flex-1 mr-2 bg-sky-100 border-teal-600 text-black"
            placeholder="How can I help you?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-between mt-4">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Save Case
          </Button>
          <div>
            <Button
              variant="ghost"
              className="mr-2 text-teal-600 hover:bg-teal-600 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="mr-2 text-teal-600 hover:bg-teal-600 hover:text-white"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="text-teal-600 hover:bg-teal-600 hover:text-white"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
