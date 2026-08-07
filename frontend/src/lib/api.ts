import type { AuthResponse, Chapter, ContentItem, ContinueTopic, Course, Topic, TopicOutline, User } from '../types/api';

const TOKEN_KEY = 'medeasy.token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

type RequestOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const tokenStore = {
  get() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = options.token ?? tokenStore.get();

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}.`,
      response.status,
      payload?.errors,
    );
  }

  return (payload?.data ?? payload) as T;
}

export const api = {
  register(input: { name: string; email: string; password: string; password_confirmation: string }) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
      token: null,
    });
  },
  login(input: { email: string; password: string }) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
      token: null,
    });
  },
  logout() {
    return request<{ message: string }>('/auth/logout', { method: 'POST' });
  },
  me() {
    return request<User>('/auth/me');
  },
  updateProfile(input: { name?: string; email?: string; password?: string; password_confirmation?: string }) {
    return request<{ user: User }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  courses() {
    return request<Course[]>('/courses');
  },
  course(slug: string) {
    return request<Course>(`/courses/${slug}`);
  },
  topic(id: string | number) {
    return request<Topic>(`/topics/${id}`);
  },
  topicOutline(id: string | number) {
    return request<TopicOutline>(`/topics/${id}/outline`);
  },
  completeTopic(id: string | number) {
    return request<Topic>(`/topics/${id}/complete`, { method: 'POST' });
  },
  incompleteTopic(id: string | number) {
    return request<Topic>(`/topics/${id}/incomplete`, { method: 'POST' });
  },
  continueTopic() {
    return request<ContinueTopic | null>('/dashboard/continue');
  },
  createCourse(input: { title: string; slug: string; description?: string | null; is_published?: boolean }) {
    return request<Course>('/courses', { method: 'POST', body: JSON.stringify(input) });
  },
  updateCourse(id: number, input: { title: string; slug: string; description?: string | null; is_published?: boolean }) {
    return request<Course>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  deleteCourse(id: number) {
    return request<{ message: string }>(`/courses/${id}`, { method: 'DELETE' });
  },
  createChapter(input: { course_id: number; title: string; slug: string; description?: string | null; order_index?: number }) {
    return request<Chapter>('/chapters', { method: 'POST', body: JSON.stringify(input) });
  },
  updateChapter(id: number, input: { course_id: number; title: string; slug: string; description?: string | null; order_index?: number }) {
    return request<Chapter>(`/chapters/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  deleteChapter(id: number) {
    return request<{ message: string }>(`/chapters/${id}`, { method: 'DELETE' });
  },
  createTopic(input: { chapter_id: number; title: string; slug: string; order_index?: number }) {
    return request<Topic>('/topics', { method: 'POST', body: JSON.stringify(input) });
  },
  updateTopic(id: number, input: { chapter_id: number; title: string; slug: string; order_index?: number }) {
    return request<Topic>(`/topics/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  deleteTopic(id: number) {
    return request<{ message: string }>(`/topics/${id}`, { method: 'DELETE' });
  },
  createContentItem(input: ContentItemInput, file?: File) {
    return request<ContentItem>('/content-items', {
      method: 'POST',
      body: contentItemBody(input, file),
    });
  },
  updateContentItem(id: number, input: ContentItemInput, file?: File) {
    return request<ContentItem>(`/content-items/${id}`, {
      method: 'POST',
      body: contentItemBody(input, file),
    });
  },
  deleteContentItem(id: number) {
    return request<{ message: string }>(`/content-items/${id}`, { method: 'DELETE' });
  },
};

interface ContentItemInput {
  topic_id: number;
  type: 'text' | 'markdown' | 'pdf' | 'video';
  title: string;
  body?: string;
  youtube_url?: string;
  order_index?: number;
}

function contentItemBody(input: ContentItemInput, file?: File): FormData | string {
  if (input.type === 'pdf') {
    const formData = new FormData();
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
    if (file) {
      formData.append('file', file);
    }
    return formData;
  }

  return JSON.stringify(input);
}
