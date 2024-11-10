// components/JudgementsTabContent.tsx

import { Document } from "@/app/types/types";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface JudgementsTabContentProps {
  documents: Document[];
}

export default function JudgementsTabContent({ documents }: JudgementsTabContentProps) {
  return (
    <div className="space-y-4 mt-4">
      {documents
        .sort((a, b) => Number(b.similarity) - Number(a.similarity))
        .map((document, index) => (
          <Card key={index} className="p-4 bg-sky-100 shadow-md w-full">
            <h3 className="text-lg font-semibold text-teal-800">
              {document.forderung}
            </h3>
            <p className="text-sm text-teal-600">
              {document.source} - {document.signatur}
            </p>
            <p className="text-sm text-gray-600">Date: {document.datum}</p>
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
              {document.origin} Similarity: {document.similarity}
            </p>

            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value={`doc-${index}`}>
                <AccordionTrigger>Expand PDF</AccordionTrigger>
                <AccordionContent>
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "100%" }}
                  >
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
  );
}
