import React, { useState } from 'react'
import { useUserStore } from '../store/useUserStore';
import { LayoutGrid, Search, Upload } from 'lucide-react';

function Header({ searchQuery,setSearchQuery }) {
  const { userName } = useUserStore();


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };


  return (
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
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
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
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header