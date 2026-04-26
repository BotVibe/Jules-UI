export interface GithubRepo {
  owner: string;
  repo: string;
  isPrivate: boolean;
  defaultBranch: { displayName: string };
  branches: { displayName: string }[];
}

export interface Source {
  name: string;
  id: string;
  githubRepo: GithubRepo;
}

export interface ListSourcesResponse {
  sources: Source[];
  nextPageToken?: string;
}

export interface Session {
  name: string;
  id: string;
  prompt: string;
  title: string;
  state: string;
  url: string;
  createTime: string;
  updateTime: string;
  outputs?: any[];
}

export interface ListSessionsResponse {
  sessions: Session[];
  nextPageToken?: string;
}

export interface CreateSessionRequest {
  prompt: string;
  title?: string;
  sourceContext?: {
    source: string;
    githubRepoContext?: {
      startingBranch: string;
    }
  };
  requirePlanApproval?: boolean;
}

export interface PlanStep {
  id: string;
  index: number;
  title: string;
  description: string;
}

export interface Activity {
  name: string;
  id: string;
  originator: string;
  description: string;
  createTime: string;
  planGenerated?: {
    plan: {
      id: string;
      steps: PlanStep[];
      createTime: string;
    }
  };
  progressUpdated?: {
    title: string;
    description: string;
  };
  artifacts?: any[];
  sessionCompleted?: any;
  agentMessaged?: { agentMessage: string };
  userMessaged?: { userMessage: string };
  sessionFailed?: {
    reason: string;
  };
}

export interface ListActivitiesResponse {
  activities: Activity[];
  nextPageToken?: string;
}
