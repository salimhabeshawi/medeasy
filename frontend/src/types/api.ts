export type Role = 'student' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_super_admin?: boolean;
  year?: number | null;
  semester?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  is_published: boolean;
  year: number;
  semester: number;
  chapters?: Chapter[];
  created_at?: string;
  updated_at?: string;
  completion_percentage?: number;
  completed_topics_count?: number;
  topics_count?: number;
}

export interface Chapter {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  topics?: Topic[];
}

export type TopicStatus = 'not_started' | 'in_progress' | 'complete';

export interface Topic {
  id: number;
  chapter_id: number;
  title: string;
  slug: string;
  order_index: number;
  content_items?: ContentItem[];
  status?: TopicStatus;
  is_complete?: boolean;
  last_viewed_at?: string;
}

export type ContentItemType = 'text' | 'markdown' | 'pdf' | 'youtube' | 'video';

export interface ContentItem {
  id: number;
  topic_id: number;
  type: ContentItemType;
  title: string | null;
  order_index: number;
  body?: string | null;
  file_url?: string | null;
  file_mime?: string | null;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
}

export interface ContinueTopic {
  course: Pick<Course, 'id' | 'title' | 'slug'>;
  chapter: Pick<Chapter, 'id' | 'title' | 'slug'>;
  topic: Pick<Topic, 'id' | 'title' | 'slug'>;
  last_viewed_at?: string;
}

export interface TopicOutlineTopic {
  id: number;
  title: string;
  slug: string;
  order_index: number;
}

export interface TopicOutlineChapter {
  id: number;
  title: string;
  slug: string;
  order_index: number;
  topics: TopicOutlineTopic[];
}

export interface TopicOutline {
  course: Pick<Course, 'id' | 'title' | 'slug'>;
  chapters: TopicOutlineChapter[];
}

export interface ApiValidationError {
  message?: string;
  errors?: Record<string, string[]>;
}
