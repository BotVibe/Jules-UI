import useSWR from 'swr';
import { getActivities, sendMessage } from '../lib/api';
import type { Activity } from '../types/jules';
import { ArtifactDiff } from './ArtifactDiff';
import { CheckCircle2, CircleDashed, XCircle, Bot, User, Clock } from 'lucide-react';

import { useState } from "react";
import { Send } from "lucide-react";
interface ActivityTimelineProps {
  apiKey: string;
  sessionId: string;
}
export const ActivityTimeline = ({ apiKey, sessionId }: ActivityTimelineProps) => {
  const [showAll, setShowAll] = useState(false);

  const [messagePrompt, setMessagePrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);


  // Poll every 5 seconds
  const { data, error } = useSWR(
    apiKey && sessionId ? ['activities', apiKey, sessionId] : null,
    ([, key, id]) => getActivities(key, id),
    { refreshInterval: 5000 }
  );

  if (error && error.status !== 404) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg max-w-md mx-auto mb-6">
        Failed to load activities: {error.message}
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagePrompt.trim()) return;
    setIsSending(true);
    setSendError(null);
    try {
      await sendMessage(apiKey, sessionId, messagePrompt);
      setMessagePrompt("");
    } catch (err: any) {
      setSendError(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const isLoading = (!data && !error) || (error && error.status === 404);

  const activities = data?.activities || [];
  // Sort activities by createTime ascending
  const sortedActivities = [...activities].sort((a, b) =>
    new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
  );
  const displayedActivities = showAll ? sortedActivities : sortedActivities.slice(-5);

  return (
    <div className="p-4 bg-white shadow rounded-lg max-w-md mx-auto mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
        <span>Session Timeline</span>
        <span className="text-xs text-gray-500 font-normal">Polling active...</span>
      </h2>

      <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {!showAll && sortedActivities.length > 5 && (
          <button onClick={() => setShowAll(true)} className="text-xs text-blue-500 hover:text-blue-700 py-2">
            Load older activities ({sortedActivities.length - 5} hidden)...
          </button>
        )}
        {displayedActivities.map((act) => (
          <ActivityItem key={act.id} activity={act} />
        ))}
        {isLoading ? (
          <div className="text-gray-500 text-sm text-center py-4 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            {error && error.status === 404 ? "Initializing session..." : "Loading session activities..."}
          </div>
        ) : activities.length === 0 && !error && (
          <div className="text-gray-500 text-sm text-center py-4">Waiting for activities...</div>
        )}
      </div>

      {!isLoading && !error && (
        <form onSubmit={handleSendMessage} className="mt-6 flex flex-col gap-2 pt-4 border-t border-gray-100">
          {sendError && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{sendError}</div>}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={messagePrompt}
              onChange={(e) => setMessagePrompt(e.target.value)}
              placeholder="Reply to Jules..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !messagePrompt.trim()}
              className="p-2 rounded-full bg-blue-600 text-white disabled:bg-gray-400 hover:bg-blue-700 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};


const ActivityItem = ({ activity }: { activity: Activity }) => {
  const isAgent = activity.originator === 'agent' || activity.originator === 'system';

  const renderIcon = () => {
    if (activity.sessionCompleted) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (activity.sessionFailed) return <XCircle className="w-5 h-5 text-red-500" />;
    if (activity.planGenerated) return <CircleDashed className="w-5 h-5 text-blue-500" />;
    if (isAgent) return <Bot className="w-5 h-5 text-purple-500" />;
    return <User className="w-5 h-5 text-gray-600" />;
  };

  const renderContent = () => {
    if (activity.planGenerated) {
      return (
        <div className="mt-2 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
          <p className="font-medium text-gray-700 mb-2">Plan generated:</p>
          <ol className="list-decimal pl-4 space-y-1">
            {activity.planGenerated.plan.steps.map(step => (
              <li key={step.id}>
                <span className="font-medium">{step.title}</span>
                <p className="text-gray-500 text-xs mt-0.5">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      );
    }
    if (activity.progressUpdated) {
      return (
        <div className="mt-2 text-sm">
          <p className="font-medium text-gray-800">{activity.progressUpdated.title}</p>
          <p className="text-gray-600">{activity.progressUpdated.description}</p>
        </div>
      );
    }
    if (activity.agentMessaged) {
      return (
        <div className="mt-2 text-sm bg-purple-50 text-purple-900 p-3 rounded-md">
          {activity.agentMessaged.agentMessage || JSON.stringify(activity.agentMessaged)}
        </div>
      );
    }
    if (activity.userMessaged) {
      return (
        <div className="mt-2 text-sm bg-gray-100 text-gray-800 p-3 rounded-md">
          {activity.userMessaged.userMessage || JSON.stringify(activity.userMessaged)}
        </div>
      );
    }
    if (activity.sessionFailed) {
      return (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          Failed: {activity.sessionFailed.reason}
        </div>
      );
    }
    if (activity.artifacts && activity.artifacts.length > 0) {
      return (
        <div className="mt-2 space-y-2">
          {activity.artifacts.map((artifact, i) => {
             if (artifact.changeSet && artifact.changeSet.gitPatch) {
                return <ArtifactDiff key={i} diff={artifact.changeSet.gitPatch.unidiffPatch} filename={artifact.changeSet.gitPatch.suggestedCommitMessage} />;
             }
             if (artifact.bashOutput) {
                return (
                  <div key={i} className="bg-gray-900 text-green-400 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                    $ {artifact.bashOutput.command}
                    {'\n'}
                    {artifact.bashOutput.output}
                  </div>
                );
             }
             return (
      <div className="mt-2 text-xs bg-gray-100 text-gray-800 p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
        {JSON.stringify(activity, null, 2)}
      </div>
    );
          })}
        </div>
      );
    }

    return (
      <div className="mt-2 text-xs bg-gray-100 text-gray-800 p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
        {JSON.stringify(activity, null, 2)}
      </div>
    );
  };

  return (
    <div className="relative flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="relative z-10 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 shrink-0">
          {renderIcon()}
        </div>
        <div className="pt-2 max-w-[280px]">
          <p className="text-sm font-semibold text-gray-900">{activity.description}</p>
          {renderContent()}
        </div>
      </div>
      <div className="pt-2 flex items-center gap-1 text-xs text-gray-400 shrink-0">
        <Clock className="w-3 h-3" />
        {new Date(activity.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};
