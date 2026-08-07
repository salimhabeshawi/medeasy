import type { Course, Topic, TopicStatus } from '../types/api';

export function topicStatus(topic: Topic): TopicStatus {
  if (topic.status) {
    return topic.status;
  }

  if (topic.is_complete) {
    return 'complete';
  }

  return topic.last_viewed_at ? 'in_progress' : 'not_started';
}

export function courseTopicCounts(course: Course) {
  const topics = course.chapters?.flatMap((chapter) => chapter.topics ?? []) ?? [];
  const total = course.topics_count ?? topics.length;
  const completed = course.completed_topics_count ?? topics.filter((topic) => topicStatus(topic) === 'complete').length;

  return { total, completed };
}

export function courseCompletion(course: Course) {
  if (typeof course.completion_percentage === 'number') {
    return Math.round(course.completion_percentage);
  }

  const { total, completed } = courseTopicCounts(course);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
