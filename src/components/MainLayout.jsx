import React, { useState, useCallback } from 'react';
import { useUserStore } from '../store/useUserStore';
import Gallery from './Gallery';
import Feed from './Feed';
import { LayoutGrid, Search, Upload } from 'lucide-react';

const MainLayout = () => {
  const { userName } = useUserStore();
  const [activeView, setActiveView] = useState('gallery');
  const [searchQuery, setSearchQuery] = useState('');

  // Controlled input handler
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleViewChange = useCallback((view) => {
    setActiveView(view);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Enhanced Header */}
      <header className="h-16 border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="h-full max-w-[1920px] mx-auto px-6 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutGrid size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">GalleryStream</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tags, users..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                aria-label="Search images"
              />
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-6 shrink-0">
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleViewChange('gallery')}
                className={`text-sm font-medium transition-colors ${
                  activeView === 'gallery' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Explore
              </button>
              <button
                onClick={() => handleViewChange('feed')}
                className={`text-sm font-medium transition-colors ${
                  activeView === 'feed' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Live Feed
              </button>
            </nav>

            <button className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Upload size={16} />
              Upload
            </button>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

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
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Filter
              </button>
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
