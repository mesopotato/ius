// components/Sidebar.tsx

import { Button } from "@/components/ui/button";
import { MessageCircle, User, Settings, HelpCircle, Folder } from "lucide-react";

export default function Sidebar() {
  return (
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
  );
}
