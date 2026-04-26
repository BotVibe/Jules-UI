import { SWRConfig } from "swr";
import { useState, useEffect } from "react";
import { SettingsForm } from "./components/SettingsForm";
import { CreateSession } from "./components/CreateSession";
import { ActivityTimeline } from "./components/ActivityTimeline";
import { Bot } from "lucide-react";
import { BurgerMenu } from "./components/BurgerMenu";

function localStorageProvider() {
  const map = new Map<string, any>(JSON.parse(localStorage.getItem("app-cache") || "[]"));
  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("app-cache", appCache);
  });
  return map as any;
}

function App() {
  const [apiKey, setApiKey] = useState<string>("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"new" | "session" | "settings">("new");

  useEffect(() => {
    const savedKey = localStorage.getItem("jules_api_key");
    if (savedKey) setApiKey(savedKey);

    const savedSession = localStorage.getItem("jules_active_session");
    if (savedSession) setActiveSessionId(savedSession);
  }, []);

  useEffect(() => {
    if (!apiKey) {
      setCurrentView("settings");
    } else if (activeSessionId) {
      setCurrentView("session");
    } else {
      setCurrentView("new");
    }
  }, [apiKey, activeSessionId]);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("jules_api_key", key);
  };

  const handleSessionCreated = (sessionId: string) => {
    setActiveSessionId(sessionId);
    localStorage.setItem("jules_active_session", sessionId);
    setCurrentView("session");
  };

  const handleNavigate = (view: "new" | "settings" | "session", sessionId?: string) => {
    setCurrentView(view);
    if (sessionId) {
      setActiveSessionId(sessionId);
      localStorage.setItem("jules_active_session", sessionId);
    }
  };

  return (
    <SWRConfig value={{ provider: localStorageProvider, revalidateOnFocus: false, revalidateIfStale: false }}>
      <div className="min-h-screen bg-gray-100 font-sans pb-10">
        <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {apiKey && <BurgerMenu apiKey={apiKey} activeSessionId={activeSessionId} onNavigate={handleNavigate} />}
            <Bot className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Jules Mobile</h1>
          </div>
        </header>

        <main className="p-4">
          {!apiKey || currentView === "settings" ? (
            <div className="mt-8">
              {!apiKey && (
                <div className="mb-6 max-w-md mx-auto text-center text-gray-600">
                  <p>Welcome! Please enter your Jules API Key to get started.</p>
                </div>
              )}
              <SettingsForm savedKey={apiKey} onSave={handleSaveKey} />
            </div>
          ) : currentView === "new" ? (
            <div className="mt-4">
              <CreateSession apiKey={apiKey} onSessionCreated={handleSessionCreated} />
            </div>
          ) : currentView === "session" && activeSessionId ? (
            <div className="mt-4">
              <ActivityTimeline apiKey={apiKey} sessionId={activeSessionId} />
            </div>
          ) : null}
        </main>
      </div>
    </SWRConfig>
  );
}

export default App;
