import React, { useState } from "react";
import { useUserStore } from "../store/useUserStore";

function AuthUser() {
  const { setUserName } = useUserStore();
  const [nameInput, setNameInput] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            GalleryStream
          </h1>
          <p className="text-gray-600">
            Enter your name to join the session
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your Name"
            className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none border border-gray-300 placeholder-gray-400 transition-all"
            autoFocus
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
          >
            Start Exploring
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthUser;
