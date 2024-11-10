// components/HistoryPanel.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Article, Document } from "@/app/types/types";
import LawTabContent from "./LawTabContent";
import JudgementsTabContent from "./JudgementsTabContent";
import HistoryTabContent from "./HistoryTabContent";

interface HistoryPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  articles: Article[];
  documents: Document[];
}

export default function HistoryPanel({
  activeTab,
  onTabChange,
  articles,
  documents,
}: HistoryPanelProps) {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-150px)] bg-sky-100 rounded-xl shadow-lg border border-teal-600 overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
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
          {/* Tabs Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="history" className="h-full overflow-y-auto p-4">
              <HistoryTabContent />
            </TabsContent>
            <TabsContent value="law" className="h-full overflow-y-auto p-4">
              <LawTabContent articles={articles} />
            </TabsContent>
            <TabsContent value="judgements" className="h-full overflow-y-auto p-4">
              <JudgementsTabContent documents={documents} />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
