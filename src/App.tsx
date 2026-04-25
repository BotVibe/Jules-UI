import { useState, useEffect } from 'react';
import { SettingsForm } from './components/SettingsForm';
import { CreateSession } from './components/CreateSession';
import { ActivityTimeline } from './components/ActivityTimeline';
import { Bot } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('jules_api_key');
    if (savedKey) setApiKey(savedKey);

    const savedSession = localStorage.getItem('jules_active_session');
    if (savedSession) setActiveSessionId(savedSession);
  }, []);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('jules_api_key', key);
  };

  const handleSessionCreated = (sessionId: string) => {
    setActiveSessionId(sessionId);
    localStorage.setItem('jules_active_session', sessionId);
  };

  const handleClearSession = () => {
    setActiveSessionId(null);
    localStorage.removeItem('jules_active_session');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10">
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">Jules Mobile</h1>
        </div>
        {activeSessionId && (
          <button
            onClick={handleClearSession}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
          >
            New Session
          </button>
        )}
      </header>

      <main className="p-4">
        {!apiKey ? (
          <div className="mt-8">
            <div className="mb-6 max-w-md mx-auto text-center text-gray-600">
              <p>Welcome! Please enter your Jules API Key to get started.</p>
            </div>
            <SettingsForm savedKey={apiKey} onSave={handleSaveKey} />
          </div>
        ) : (
          <div className="mt-4">
            {!activeSessionId ? (
              <CreateSession apiKey={apiKey} onSessionCreated={handleSessionCreated} />
            ) : (
              <ActivityTimeline apiKey={apiKey} sessionId={activeSessionId} />
            )}

            <div className="mt-12">
              <details className="max-w-md mx-auto">
                <summary className="text-sm text-gray-500 cursor-pointer mb-2 text-center">Settings</summary>
                <SettingsForm savedKey={apiKey} onSave={handleSaveKey} />
              </details>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
