"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import ReactMarkdown from "react-markdown";

import {
  MessageCircle,
  User,
  Settings,
  HelpCircle,
  Folder,
  Send,
  Plus,
  Info,
  MessageSquare,
} from "lucide-react";

import React, { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
// inporting environment variables

export default function Component() {
  interface Document {
    origin: string;
    id: number;
    parsed_id: number;
    similarity: string;
    forderung: string;
    file_path: string;
    datum: string;
    case_number: string;
    signatur: string;
    source: string;
  }

  interface Article {
    srn: string;
    shortName: string;
    book_name: string;
    part_name: string;
    title_name: string;
    sub_title_name: string;
    chapter_name: string;
    sub_chapter_name: string;
    section_name: string;
    sub_section_name: string;
    art_id: string;
    full_article: string;
    title: string;
    sourcelink: string;
    source_table: string;
    similarity: number;
  }

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  ); // Type annotation added

  const [documents, setDocuments] = useState<Document[]>([]); // You can define a proper type if you know the structure
  const [articles, setArticles] = useState<Article[]>([]); // You can define a proper type if you know the structure
  const [activeTab, setActiveTab] = useState("history");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("scrolling to bottom");
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /*const textareaRef = useRef<HTMLTextAreaElement>(null)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Function to process article text
  interface ProcessedArticleText {
    parts: (string | JSX.Element)[];
    footnotes: string[];
  }
        */

  const processArticleText = (text: string): (string | JSX.Element)[] => {
    const footnoteRegex = /footnote\{([^}]*)\}/g;
    let match: RegExpExecArray | null;
    const footnotes: string[] = [];
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let footnoteIndex = 1;

    while ((match = footnoteRegex.exec(text)) !== null) {
      // Get the text before the footnote

      const start = match.index;
      const end = footnoteRegex.lastIndex;

      // Text before the footnote
      const textBefore = text.substring(lastIndex, start);

      // Footnote content
      const footnoteContent = match[1];

      // Add text before the footnote
      parts.push(textBefore);

      // Create a footnote marker with tooltip
      parts.push(
        <sup
          key={`footnote-${footnoteIndex}-${start}`}
          className="cursor-pointer text-blue-600"
          title={footnoteContent}
        >
          [{footnoteIndex}]
        </sup>
      );

      // Store the footnote content if needed
      footnotes.push(footnoteContent);

      // Update lastIndex
      lastIndex = end;

      footnoteIndex++;
    }

    // Add remaining text after the last footnote
    parts.push(text.substring(lastIndex));

    return parts;
  };

  const handleSend = async () => {
    if (!inputValue.trim()) {
      return;
    }

    const user_input = inputValue; // Save the input value
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: user_input },
    ]);
    setInputValue(""); // Clear the input field

    try {
      //const response = await fetch("http://localhost:3001/search", {
      const response = await fetch("https://iuslex.cloud/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: user_input }),
      });

      const data = await response.json();

      if (response.ok) {
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

  const [isHuman, setIsHuman] = useState(false);
  const recaptchaRef = useRef(null);

  const handleCaptchaVerify = async (token: string | null) => {
    if (token) {
      try {

        const response = await fetch("https://iuslex.cloud/api/verify-recaptcha", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

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

  return (
    <div>
      {!isHuman ? (
        // Render the CAPTCHA verification form
        <div className="flex h-screen justify-center items-center bg-sky-100">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-teal-800 mb-4">
              Please verify that you are a human
            </h2>
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY  || ""}
              onChange={handleCaptchaVerify}
              ref={recaptchaRef}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-screen bg-teal-600 p-4">
          {/* Sidebar */}
          <div className="w-64 bg-teal-700 p-4 text-white rounded-xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold">IUS</h1>
              <p className="text-xs">FAST AND FAIR LEGAL ACTION FOR EVERYONE</p>
            </div>
            <nav className="space-y-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-teal-600 hover:text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                IUS Chat
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-teal-600 hover:text-white"
              >
                <User className="mr-2 h-4 w-4" />
                My Account
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-teal-600 hover:text-white"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-teal-600 hover:text-white"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                FAQ
              </Button>
            </nav>
            <div className="mt-8">
              <h2 className="mb-2 text-sm font-semibold">Saved Cases</h2>
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-teal-600 hover:text-white"
                >
                  <Folder className="mr-2 h-4 w-4" />
                  Can I get a Pit Bull?
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-teal-600 hover:text-white"
                >
                  <Folder className="mr-2 h-4 w-4" />
                  Case X3528
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-teal-600 hover:text-white"
                >
                  <Folder className="mr-2 h-4 w-4" />
                  Inheritance law
                </Button>
              </nav>
            </div>
          </div>

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
                  <div className="flex-1 flex flex-col h-[calc(100vh-150px)] bg-sky-100 rounded-xl shadow-lg mr-4 p-4 border border-teal-600">
                    {/* This div holds the messages and is scrollable */}
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
                                {/* Render message text as Markdown */}
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
                          onClick={handleSend}
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
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={30}>
                  {/* History Panel */}
                  <div className="flex-1 flex flex-col h-[calc(100vh-150px)] bg-sky-100 rounded-xl shadow-lg border border-teal-600 overflow-hidden">
                    <Tabs
                      value={activeTab}
                      onValueChange={(value) => setActiveTab(value)}
                      className="flex flex-col h-full"
                    >
                      {/* Tabs List */}
                      <TabsList className="w-full bg-sky-100 flex-shrink-0">
                        <TabsTrigger
                          value="history"
                          className="flex-1 data-[state=active]:bg-teal-600 data-[state=active]:text-white hover:bg-teal-600 hover:text-white mr-2"
                        >
                          History
                        </TabsTrigger>
                        <TabsTrigger
                          value="law"
                          className="flex-1 data-[state=active]:bg-teal-600 data-[state=active]:text-white hover:bg-teal-600 hover:text-white mr-2"
                        >
                          Law
                        </TabsTrigger>
                        <TabsTrigger
                          value="judgements"
                          className="flex-1 data-[state=active]:bg-teal-600 data-[state=active]:text-white hover:bg-teal-600 hover:text-white mr-2"
                        >
                          Case Law
                        </TabsTrigger>
                      </TabsList>
                      <ScrollArea className="flex-1 overflow-y-auto border-0 shadow-md ">
                        {/* History Tab Content */}
                        <div className="flex-1 overflow-hidden">
                          <TabsContent
                            value="history"
                            className="h-full overflow-y-auto p-4"
                          >
                            <div className="space-y-4 mt-4">
                              {[
                                "TODO user history table required / authentication etc",
                                "TODO session handling for API ",
                                "TODO user input preprocessing",
                                "TODO websockets (streamen) wegen warten (evtl antwort auf atikel konzentrieren) danach präzedenzfälle preprocessieren und streamen)",
                                "TODO a little animation beim waiting would be nice",
                                "TODO prompt engineering for citations",
                                "TODO prod vs dev switches for endpoints etc.",
                                "TODO db security / fixing of other no-gos",
                                "TODO load balancing / scaling",
                                "TODO firewall / ddos protection",
                                "TODO SSH hardening / key management",
                                "TODO CD (watchtower) / CI (github actions)",
                              ].map((question, index) => (
                                <Card
                                  key={index}
                                  className="p-4 bg-sky-100 shadow-md"
                                >
                                  <p className="text-sm text-teal-800">
                                    {question}
                                  </p>
                                  <div className="flex justify-end mt-2">
                                    <Button
                                      variant="ghost"
                                      className="text-xs mr-2 text-teal-600 hover:bg-teal-600 hover:text-white"
                                    >
                                      Show
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      className="text-xs text-teal-600 hover:bg-teal-600 hover:text-white"
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                            <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white">
                              Clear History
                            </Button>
                          </TabsContent>

                          {/* Law Tab Content */}
                          <TabsContent
                            value="law"
                            className="h-full overflow-y-auto p-4"
                          >
                            <div className="space-y-4 mt-4">
                              {articles
                                .sort((a, b) => b.similarity - a.similarity)
                                .map((article, index) => (
                                  <Card
                                    key={index}
                                    className="p-4 bg-sky-100 shadow-md"
                                  >
                                    <h3 className="text-lg font-semibold text-teal-800">
                                      {article.title}
                                    </h3>
                                    <h2 className="text-md font-semibold text-sky-500">
                                      <a
                                        href={article.sourcelink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {article.source_table ===
                                        "articles_bern"
                                          ? "Belex"
                                          : "Fedlex"}{" "}
                                        SRN: {article.srn}
                                      </a>
                                    </h2>
                                    {article.book_name && (
                                      <p>
                                        <strong>{article.book_name}</strong>
                                      </p>
                                    )}
                                    {article.part_name && (
                                      <p>
                                        <strong>{article.part_name}</strong>
                                      </p>
                                    )}
                                    {article.title_name && (
                                      <p>
                                        <strong>{article.title_name}</strong>
                                      </p>
                                    )}
                                    {article.sub_title_name && (
                                      <p>
                                        <strong>
                                          {article.sub_title_name}
                                        </strong>
                                      </p>
                                    )}
                                    {article.chapter_name && (
                                      <p>
                                        <strong>{article.chapter_name}</strong>
                                      </p>
                                    )}
                                    {article.sub_chapter_name && (
                                      <p>
                                        <strong>
                                          {article.sub_chapter_name}
                                        </strong>
                                      </p>
                                    )}
                                    {article.section_name && (
                                      <p>
                                        <strong>{article.section_name}</strong>
                                      </p>
                                    )}
                                    {article.sub_section_name && (
                                      <p>
                                        <strong>
                                          {article.sub_section_name}
                                        </strong>
                                      </p>
                                    )}
                                    <p>
                                      <strong>Article ID:</strong>{" "}
                                      {article.art_id}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {article.shortName} Similarity:{" "}
                                      {article.similarity}
                                    </p>

                                    <Accordion
                                      type="single"
                                      collapsible
                                      className="mt-2"
                                    >
                                      <AccordionItem value={`item-${index}`}>
                                        <AccordionTrigger>
                                          View Full Article
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <p className="text-sm text-teal-800 whitespace-pre-wrap">
                                            {processArticleText(
                                              article.full_article
                                            )}
                                          </p>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>

                                    {article.sourcelink && (
                                      <div className="mt-2">
                                        <a
                                          href={article.sourcelink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-teal-600 underline"
                                        >
                                          View Source
                                        </a>
                                      </div>
                                    )}
                                  </Card>
                                ))}
                            </div>
                          </TabsContent>

                          {/* Judgements Tab Content */}
                          <TabsContent
                            value="judgements"
                            className="h-full overflow-y-auto p-2"
                          >
                            <div className="space-y-4 mt-4">
                              {documents
                                .sort(
                                  (a, b) =>
                                    Number(b.similarity) - Number(a.similarity)
                                )
                                .map((document, index) => (
                                  <Card
                                    key={index}
                                    className="p-4 bg-sky-100 shadow-md w-full"
                                  >
                                    <h3 className="text-lg font-semibold text-teal-800">
                                      {document.forderung}
                                    </h3>
                                    <p className="text-sm text-teal-600">
                                      {document.source} - {document.signatur}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Date: {document.datum}
                                    </p>
                                    <p className="text-sm text-teal-800 mt-2">
                                      <a
                                        href={document.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline text-teal-600"
                                      >
                                        Case Number {document.case_number}
                                      </a>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {document.origin} Similarity:{" "}
                                      {document.similarity}
                                    </p>

                                    <Accordion
                                      type="single"
                                      collapsible
                                      className="mt-2"
                                    >
                                      <AccordionItem value={`doc-${index}`}>
                                        <AccordionTrigger>
                                          Expand PDF
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <div
                                            className="relative w-full"
                                            style={{ paddingBottom: "100%" }}
                                          >
                                            {" "}
                                            {/* This maintains a 1:1 aspect ratio */}
                                            <iframe
                                              src={document.file_path}
                                              className="absolute top-0 left-0 w-full h-full"
                                              frameBorder="0"
                                              allowFullScreen
                                            ></iframe>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>
                                  </Card>
                                ))}
                            </div>
                          </TabsContent>
                        </div>
                      </ScrollArea>
                    </Tabs>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
