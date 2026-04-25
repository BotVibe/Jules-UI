import useSWR from 'swr';
import { getActivities } from '../lib/api';
import type { Activity } from '../types/jules';
import { ArtifactDiff } from './ArtifactDiff';
import { CheckCircle2, CircleDashed, XCircle, Bot, User, Clock } from 'lucide-react';

interface ActivityTimelineProps {
  apiKey: string;
  sessionId: string;
}

export const ActivityTimeline = ({ apiKey, sessionId }: ActivityTimelineProps) => {
  // Poll every 5 seconds
  const { data, error } = useSWR(
    apiKey && sessionId ? ['activities', apiKey, sessionId] : null,
    ([, key, id]) => getActivities(key, id),
    { refreshInterval: 5000 }
  );

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg max-w-md mx-auto mb-6">
        Failed to load activities: {error.message}
      </div>
    );
  }

  const activities = data?.activities || [];
  // Sort activities by createTime ascending
  const sortedActivities = [...activities].sort((a, b) =>
    new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
  );

  return (
    <div className="p-4 bg-white shadow rounded-lg max-w-md mx-auto mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
        <span>Session Timeline</span>
        <span className="text-xs text-gray-500 font-normal">Polling active...</span>
      </h2>

      <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {sortedActivities.map((act) => (
          <ActivityItem key={act.id} activity={act} />
        ))}
        {activities.length === 0 && !error && (
          <div className="text-gray-500 text-sm text-center py-4">Waiting for activities...</div>
        )}
      </div>
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
          {activity.agentMessaged.message}
        </div>
      );
    }
    if (activity.userMessaged) {
      return (
        <div className="mt-2 text-sm bg-gray-100 text-gray-800 p-3 rounded-md">
          {activity.userMessaged.message}
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
             return null;
          })}
        </div>
      );
    }

    return null;
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
