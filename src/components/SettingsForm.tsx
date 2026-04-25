import { useState, useEffect } from 'react';
import { Key } from 'lucide-react';

interface SettingsProps {
  onSave: (key: string) => void;
  savedKey: string;
}

export const SettingsForm = ({ onSave, savedKey }: SettingsProps) => {
  const [apiKey, setApiKey] = useState(savedKey);

  useEffect(() => {
    setApiKey(savedKey);
  }, [savedKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(apiKey);
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg mb-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">API Key Settings</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Google Jules API Key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="border rounded p-2 text-base text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter your API Key..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white font-medium py-2 rounded shadow hover:bg-blue-700 transition active:scale-95"
        >
          Save Key
        </button>
      </form>
    </div>
  );
};
