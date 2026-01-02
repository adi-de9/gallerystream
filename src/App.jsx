import React from 'react';
import { useUserStore } from './store/useUserStore';
import MainLayout from './components/MainLayout';

function App() {
  const { userName, setUserName } = useUserStore();
  const [nameInput, setNameInput] = React.useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }
  };

  if (!userName) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">GalleryStream</h1>
          <p className="text-gray-400 text-center mb-8">Enter your name to join the session</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600 placeholder-gray-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Exploring
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <MainLayout />;
}

export default App;