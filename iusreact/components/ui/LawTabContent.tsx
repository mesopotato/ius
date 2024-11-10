// components/LawTabContent.tsx

import { Article } from "@/app/types/types";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import React from "react";

interface LawTabContentProps {
  articles: Article[];
}

export default function LawTabContent({ articles }: LawTabContentProps) {
  const renderArticleWithFootnotes = (text: string): (string | JSX.Element)[] => {
    const footnoteRegex = /footnote\{([^}]*)\}/g;
    let match: RegExpExecArray | null;
    const footnotes: string[] = [];
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let footnoteIndex = 1;

    while ((match = footnoteRegex.exec(text)) !== null) {
      const start = match.index;
      const end = footnoteRegex.lastIndex;
      const textBefore = text.substring(lastIndex, start);
      const footnoteContent = match[1];

      parts.push(textBefore);
      parts.push(
        <sup
          key={`footnote-${footnoteIndex}-${start}`}
          className="cursor-pointer text-blue-600"
          title={footnoteContent}
        >
          [{footnoteIndex}]
        </sup>
      );

      footnotes.push(footnoteContent);
      lastIndex = end;
      footnoteIndex++;
    }

    parts.push(text.substring(lastIndex));
    return parts;
  };

  return (
    <div className="space-y-4 mt-4">
      {articles
        .sort((a, b) => b.similarity - a.similarity)
        .map((article, index) => (
          <Card key={index} className="p-4 bg-sky-100 shadow-md">
            <h3 className="text-lg font-semibold text-teal-800">{article.title}</h3>
            <h2 className="text-md font-semibold text-sky-500">
              <a
                href={article.sourcelink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.source_table === "articles_bern" ? "Belex" : "Fedlex"} SRN:{" "}
                {article.srn}
              </a>
            </h2>
            {article.book_name && (
              <p>
                <strong>{article.book_name}</strong>
              </p>
            )}
            {/* Render other article properties similarly */}
            <p>
              <strong>Article ID:</strong> {article.art_id}
            </p>
            <p className="text-sm text-gray-600">
              {article.shortName} Similarity: {article.similarity}
            </p>

            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger>View Full Article</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-teal-800 whitespace-pre-wrap">
                    {renderArticleWithFootnotes(article.full_article)}
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
  );
}
