import React, { useState } from "react";
import Gallery from "./Gallery";
import Feed from "./Feed";
import Header from "./Header";

const MainLayout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("gallery");

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Enhanced Header */}
      <Header
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Gallery Area */}
        <div className="flex-1 relative overflow-y-auto">
          <Gallery searchQuery={searchQuery} />
        </div>

        {/* Right Sidebar - Live Activity */}
        <aside className="w-80 border-l border-gray-200 bg-white hidden lg:flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Live Activity
              </h2>
           
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Feed />
          </div>
          <div className="p-4 border-t border-gray-200">
            <button className="text-xs text-gray-600 hover:text-gray-900 w-full text-center">
              View all activity history
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default MainLayout;
