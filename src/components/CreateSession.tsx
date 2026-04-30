import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { getSources, createSession } from '../lib/api';
import type { CreateSessionRequest } from '../types/jules';

interface CreateSessionProps {
  apiKey: string;
  onSessionCreated: (sessionId: string) => void;
}

export const CreateSession = ({ apiKey, onSessionCreated }: CreateSessionProps) => {
  const [prompt, setPrompt] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useSWRConfig();

  const { data: sourcesData, error: sourcesError } = useSWR(
    apiKey ? ['sources', apiKey] : null,
    ([, key]) => getSources(key),
    { revalidateOnMount: true }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedSource) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedSourceObject = sourcesData?.sources.find((s) => s.name === selectedSource);
      const startingBranch = selectedSourceObject?.githubRepo?.defaultBranch?.displayName || "main";
      const request: CreateSessionRequest = {
        prompt,
        sourceContext: {
          source: selectedSource,
          githubRepoContext: {
            startingBranch,
          }
        },
      };

      const session = await createSession(apiKey, request);
      onSessionCreated(session.name.split('/').pop() || session.id);
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingSources = !sourcesData && !sourcesError;

  const sources = sourcesData?.sources || [];

  return (
    <div className="p-4 bg-white shadow rounded-lg mb-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">New Session</h2>

      {sourcesError && (
        <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded">
          Error loading sources: {sourcesError.message}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 text-sm text-gray-600 w-full">
          <div className="flex justify-between w-full">
            <label htmlFor="source-select">Source Repository</label>
            <button type="button" onClick={() => mutate(["sources", apiKey])} className="text-blue-500 hover:text-blue-700 text-xs">Refresh</button>
          </div>

          <select
            id="source-select"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            required
            className="border rounded p-2 text-base text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {isLoadingSources ? <option value="" disabled>Loading repositories...</option> : <option value="" disabled>Select a repository</option>}
            {sources.map((src) => (
              <option key={src.name} value={src.name}>
                {src.githubRepo.owner}/{src.githubRepo.repo}
              </option>
            ))}
          </select>
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-600 w-full">
          Prompt

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            rows={4}
            className="border rounded p-2 text-base text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            placeholder="Describe what you want Jules to do..."
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !prompt.trim() || !selectedSource}
          className="bg-blue-600 text-white font-medium py-2 rounded shadow hover:bg-blue-700 transition active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Starting...' : 'Start Session'}
        </button>
      </form>
    </div>
  );
};
