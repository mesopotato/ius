// pages/page.tsx

"use client";

import React, { useState } from "react";
import CaptchaVerification from "@/components/ui/CaptchaVerification";

import Sidebar from "@/components/ui/Sidebar";
import ChatArea from "@/components/ui/ChatArea";
import ResultPanel from "@/components/ui/ResultPanel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Document, Article, Message } from "@/app/types/types";

export default function Component() {
  const [isHuman, setIsHuman] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState("history");

  const handleCaptchaVerify = async (token: string | null) => {
    if (token) {
      if (process.env.NODE_ENV === "development") {
        console.log("Captcha token:", token);
        console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
      }
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/verify-recaptcha`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (data.success) {
          setIsHuman(true);
        } else {
          alert("Captcha verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Error verifying captcha:", error);
        alert("An error occurred during captcha verification.");
      }
    }
  };

  const handleSendMessage = async (userInput: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: userInput },
    ]);

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Sending user input:", userInput);
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: userInput }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (process.env.NODE_ENV === "development") {
          console.log("Received data:", data);
        }
        // Update chat with LLM response
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: data.llm_response },
        ]);
        // Update documents and articles
        setDocuments(data.documents);
        setArticles(data.articles);
        // Optionally switch to "Law" or "Judgments" tab
        setActiveTab("law");
      } else {
        console.error("Server Error:", data.error);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };

  return (
    <div>
      {!isHuman ? (
        <CaptchaVerification onVerify={handleCaptchaVerify} />
      ) : (
        <div className="flex h-screen bg-teal-600 p-4">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-sky-100 rounded-xl ml-4">
            <header className="bg-sky-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-semibold text-teal-800">
                Ask IUS based on Fedlex and Belex Data
              </h2>
            </header>
            <div className="flex-1 flex p-4">
              {/* Chat Area */}
              <ResizablePanelGroup
                direction="horizontal"
                className="rounded-lg border"
              >
                <ResizablePanel defaultSize={70}>
                  <ChatArea messages={messages} onSendMessage={handleSendMessage} />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={30}>
                  {/* History Panel */}
                  <ResultPanel
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    articles={articles}
                    documents={documents}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
