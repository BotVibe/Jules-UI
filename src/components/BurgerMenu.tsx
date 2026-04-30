import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Menu, X, PlusCircle, Settings, RefreshCw } from "lucide-react";
import { getSessions } from "../lib/api";

interface BurgerMenuProps {
  apiKey: string;
  activeSessionId: string | null;
  onNavigate: (view: "new" | "settings" | "session", sessionId?: string) => void;
}

export const BurgerMenu = ({ apiKey, activeSessionId, onNavigate }: BurgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useSWRConfig();

  // Use SWR to load sessions.
  const { data, isValidating } = useSWR(
    isOpen && apiKey ? ["sessions", apiKey] : null,
    ([, key]) => getSessions(key),
    { revalidateOnMount: true }
  );

  const sessionsList = (data?.sessions || []).filter(s => s.state !== "ARCHIVED");

  const handleRefresh = () => {
    mutate(["sessions", apiKey]);
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 focus:outline-none">
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={closeMenu}></div>
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-xl flex flex-col transform transition-transform text-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={closeMenu} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <button
                  onClick={() => { onNavigate("new"); closeMenu(); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-left font-medium text-blue-600"
                >
                  <PlusCircle className="w-5 h-5" /> New Session
                </button>
              </div>

              <div className="h-px bg-gray-200 mx-4 my-2"></div>

              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sessions</span>
                <button onClick={handleRefresh} className={`p-1 rounded text-gray-400 hover:text-blue-600 ${isValidating ? "animate-spin" : ""}`}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-2 space-y-1">
                {sessionsList.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400 italic">No sessions found</div>
                ) : (
                  sessionsList.map(session => {
                    const sessionId = session.name.split("/").pop() || session.id;
                    const isActive = sessionId === activeSessionId;
                    return (
                      <button
                        key={sessionId}
                        onClick={() => { onNavigate("session", sessionId); closeMenu(); }}
                        className={`w-full flex flex-col px-3 py-2 rounded-lg text-left truncate transition ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
                      >
                        <span className="text-sm font-medium truncate flex items-center justify-between gap-2">
                          {session.title || "Untitled Session"}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${session.state === "COMPLETED" ? "bg-green-100 text-green-800" : session.state === "FAILED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                            {session.state}
                          </span>
                        </span>
                        <span className="text-xs opacity-60 truncate">{session.prompt}</span>
                      </button>
                    )
                  })
                )}
              </div>

              <div className="h-px bg-gray-200 mx-4 my-4"></div>

              <div className="p-2">
                <button
                  onClick={() => { onNavigate("settings"); closeMenu(); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-left text-gray-700"
                >
                  <Settings className="w-5 h-5 text-gray-500" /> Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
