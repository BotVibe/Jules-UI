import useSWR from 'swr';
import { getActivities, sendMessage, getSession, approvePlan } from '../lib/api';
import type { Activity } from '../types/jules';
import { ArtifactDiff } from './ArtifactDiff';
import { CheckCircle2, CircleDashed, XCircle, Bot, User, Clock, RefreshCw } from 'lucide-react';

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
  const { data: sessionData } = useSWR(
    apiKey && sessionId ? ["session", apiKey, sessionId] : null,
    ([, key, id]) => getSession(key, id),
    { refreshInterval: 5000, revalidateOnMount: true }
  );

  const handleApprovePlan = async () => {
    setIsSending(true);
    setSendError(null);
    try {
      await approvePlan(apiKey, sessionId);
    } catch (err: any) {
      setSendError(err.message || "Failed to approve plan");
    } finally {
      setIsSending(false);
    }
  };

  const { data, error, mutate } = useSWR(
    apiKey && sessionId ? ['activities', apiKey, sessionId] : null,
    ([, key, id]) => getActivities(key, id),
    { refreshInterval: 5000, revalidateOnMount: true }
  );


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

      {sessionData && (
        <div className="mb-6 pb-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{sessionData.title || "Untitled Session"}</h1>
          {sessionData.sourceContext?.source && (
            <p className="text-xs text-gray-500 mt-1 font-mono">{sessionData.sourceContext.source.split("/").slice(-1)[0]}</p>
          )}
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
        <span>Session Timeline</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => mutate()}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs transition"
            title="Force refresh"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
          <span className="text-xs text-gray-500 font-normal">Polling active...</span>
        </div>
      </h2>

            {sessionData && sessionData.state === "AWAITING_PLAN_APPROVAL" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-col gap-3 items-center text-center">
          <p className="text-sm text-yellow-800">Jules is waiting for your approval to proceed with the generated plan.</p>
          <button onClick={handleApprovePlan} disabled={isSending} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded shadow transition disabled:bg-gray-400">Approve Plan</button>
        </div>
      )}

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
    const blocks = [];

    if (activity.planApproved) {
      blocks.push(
        <div key="plan-approved" className="mt-2 text-sm bg-green-50 text-green-800 p-2 rounded border border-green-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Plan Approved
        </div>
      );
    }

    if (activity.planGenerated) {
      blocks.push(
        <div key="plan-generated" className="mt-2 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
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
      blocks.push(
        <div key="progress" className="mt-2 text-sm">
          <p className="font-medium text-gray-800">{activity.progressUpdated.title}</p>
          <p className="text-gray-600">{activity.progressUpdated.description}</p>
        </div>
      );
    }
    if (activity.agentMessaged) {
      const msg = (activity.agentMessaged as any).agentMessage || (activity.agentMessaged as any).message || (activity.agentMessaged as any).text || (activity.agentMessaged as any).content;
      const textToDisplay = msg || (Object.keys(activity.agentMessaged).length > 0 ? JSON.stringify(activity.agentMessaged) : null);
      if (textToDisplay && textToDisplay.trim() !== "{}") {
        blocks.push(
        <div key="agent-msg" className="mt-2 text-sm bg-purple-50 text-purple-900 p-3 rounded-md whitespace-pre-wrap break-words">
            {textToDisplay}
          </div>
        );
      }
    }
    if (activity.userMessaged) {
      const msg = (activity.userMessaged as any).userMessage || (activity.userMessaged as any).message || (activity.userMessaged as any).text || (activity.userMessaged as any).content;
      const textToDisplay = msg || (Object.keys(activity.userMessaged).length > 0 ? JSON.stringify(activity.userMessaged) : null);
      if (textToDisplay && textToDisplay.trim() !== "{}") {
        blocks.push(
        <div key="user-msg" className="mt-2 text-sm bg-gray-100 text-gray-800 p-3 rounded-md whitespace-pre-wrap break-words">
            {textToDisplay}
          </div>
        );
      }
    }
    if (activity.sessionCompleted) {
      // Extract links if they exist in the payload
      const strPayload = JSON.stringify(activity.sessionCompleted);
      const prMatch = strPayload.match(/https:\/\/github\.com\/[^\s"']+\/pull\/\d+/);
      const branchMatch = strPayload.match(/https:\/\/github\.com\/[^\s"']+\/tree\/[^\s"']+/);
      const repoMatch = strPayload.match(/https:\/\/github\.com\/[^\s"']+\/[^\s"']+/);

      const prUrl = prMatch ? prMatch[0] : null;
      const branchUrl = branchMatch ? branchMatch[0] : null;
      // Fallback to a generic repo link if no specific PR/Branch is found but a GitHub link exists
      const repoUrl = repoMatch ? repoMatch[0] : null;

      blocks.push(
        <div key="completed" className="mt-2 text-sm bg-green-50 text-green-900 p-3 rounded-md flex flex-col gap-2 border border-green-100">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Session Completed Successfully
          </div>
          {(prUrl || branchUrl || repoUrl) && (
            <div className="flex flex-wrap gap-2 mt-1">
              {branchUrl && (
                <a href={branchUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white border border-green-200 hover:bg-green-100 rounded text-green-700 text-xs font-semibold shadow-sm transition">
                  Show Branch
                </a>
              )}
              {prUrl && (
                <a href={prUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow-sm transition">
                  Show Pull Request
                </a>
              )}
              {!prUrl && !branchUrl && repoUrl && (
                <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white border border-green-200 hover:bg-green-100 rounded text-green-700 text-xs font-semibold shadow-sm transition">
                  Open Repository
                </a>
              )}
            </div>
          )}
        </div>
      );
    }

    if (activity.sessionFailed) {
      blocks.push(
        <div key="failed" className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          Failed: {activity.sessionFailed.reason}
        </div>
      );
    }
    if (activity.artifacts && activity.artifacts.length > 0) {
      blocks.push(
        <div key="artifacts" className="mt-2 space-y-2">
          {activity.artifacts.map((artifact, i) => {
             if (artifact.changeSet && artifact.changeSet.gitPatch) {
                return <ArtifactDiff key={i} diff={artifact.changeSet.gitPatch.unidiffPatch} filename={artifact.changeSet.gitPatch.suggestedCommitMessage} />;
             }
             if (artifact.media) {
               return (
                 <div key={i} className="mt-2 rounded overflow-hidden border border-gray-200 shadow-sm">
                   <img src={`data:${artifact.media.mimeType};base64,${artifact.media.data}`} alt="Artifact" className="w-full h-auto object-contain max-h-64 bg-gray-50" />
                 </div>
               );
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
              <div key={i} className="mt-2 text-xs bg-gray-100 text-gray-800 p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(artifact, null, 2)}
              </div>
            );
          })}
        </div>
      );
    }

    if (blocks.length === 0) {
      // Last fallback: If we still have an empty block but it's a sessionCompleted, we've already handled it above so do nothing.
      // Otherwise, show the debug JSON.
      if (!activity.sessionCompleted) {
        return (
          <div className="mt-2 text-xs bg-gray-100 text-gray-800 p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(activity, null, 2)}
          </div>
        );
      }
    }

    return <>{blocks}</>;
  };

  return (
    <div className="relative flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="relative z-10 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 shrink-0">
          {renderIcon()}
        </div>
        <div className="pt-2 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{activity.description}</p>
            <button onClick={() => console.log(activity)} className="text-[10px] text-gray-400 hover:text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">Debug</button>
          </div>
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
