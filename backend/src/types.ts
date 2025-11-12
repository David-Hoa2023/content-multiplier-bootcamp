export interface Idea {
  id: number;
  title: string;
  description: string | null;
  persona: string | null;
  industry: string | null;
  status: string;
  created_at: Date;
}

export interface CreateIdeaInput {
  title: string;
  description?: string;
  persona?: string;
  industry?: string;
  status?: string;
}

export interface UpdateIdeaInput {
  title?: string;
  description?: string;
  persona?: string;
  industry?: string;
  status?: string;
}

export interface ContentPlan {
  id: number;
  idea_id: number;
  plan_content: string;
  target_audience: string | null;
  key_points: string | null;
  created_at: Date;
}

export interface CreateContentPlanInput {
  idea_id: number;
  plan_content: string;
  target_audience?: string;
  key_points?: string;
}

export interface UpdateContentPlanInput {
  plan_content?: string;
  target_audience?: string;
  key_points?: string;
}
