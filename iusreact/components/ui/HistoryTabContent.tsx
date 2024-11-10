// components/HistoryTabContent.tsx

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HistoryTabContent() {
  const historyItems = [
    "TODO user history table required / authentication etc",
    "TODO session handling for API",
    "TODO user input preprocessing",
    "TODO websockets (streaming) for waiting",
    "TODO animation during waiting",
    "TODO prompt engineering for citations and markdown",
    "TODO prod vs dev switches for endpoints etc.",
    "TODO db security / fixing of other no-gos",
    "TODO load balancing / scaling",
    "TODO firewall / ddos protection",
    "TODO SSH hardening / key management",
    "TODO CD (watchtower) / CI (github actions)",
  ];

  return (
    <div className="space-y-4 mt-4">
      {historyItems.map((item, index) => (
        <Card key={index} className="p-4 bg-sky-100 shadow-md">
          <p className="text-sm text-teal-800">{item}</p>
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
      <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white">
        Clear History
      </Button>
    </div>
  );
}
