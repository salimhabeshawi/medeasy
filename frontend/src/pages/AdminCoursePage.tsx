import { BookOpen, ChevronDown, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { Chapter, ContentItem, Course, Topic } from '../types/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBlock } from '../components/ErrorBlock';
import { FormField } from '../components/admin/FormField';

type ContentType = 'text' | 'markdown' | 'pdf' | 'video';

export function AdminCoursePage() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCourse, setEditingCourse] = useState(false);
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set());
  const [openTopics, setOpenTopics] = useState<Set<number>>(new Set());
  const [topicItems, setTopicItems] = useState<Record<number, ContentItem[]>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!courseSlug) {
      setError('Course slug is missing from the route.');
      setLoading(false);
      return;
    }

    let active = true;

    api
      .course(courseSlug)
      .then((data) => {
        if (active) {
          setCourse(data);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Course did not load.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [courseSlug]);

  async function reload() {
    if (!courseSlug) {
      return;
    }
    const data = await api.course(courseSlug);
    setCourse(data);
  }

  function toggle(setter: (fn: (current: Set<number>) => Set<number>) => void, id: number) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function loadTopicItems(topicId: number) {
    if (topicItems[topicId]) {
      return;
    }
    const topic = await api.topic(topicId);
    setTopicItems((current) => ({ ...current, [topicId]: topic.content_items ?? [] }));
  }

  async function deleteCourse() {
    if (!course || !window.confirm(`Delete "${course.title}" and all of its content? This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteCourse(course.id);
      navigate('/admin');
    } catch (deleteError) {
      setMessage(deleteError instanceof Error ? deleteError.message : 'Delete failed.');
    }
  }

  if (loading) {
    return null;
  }

  if (error || !course) {
    return <ErrorBlock message={error || 'Course was not returned by the API.'} />;
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <Link className="font-display text-sm font-bold uppercase underline decoration-2 underline-offset-4" to="/admin">
              Admin console
            </Link>
            <h1 className="mt-3 font-display text-4xl font-bold">{course.title}</h1>
            <p className="mt-1 text-sm font-semibold text-ink/70">/{course.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setEditingCourse((value) => !value)} icon={<Pencil className="h-4 w-4" />}>
              Edit course
            </Button>
            <Button variant="secondary" onClick={deleteCourse} icon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
          </div>
        </div>
        {editingCourse ? <CourseEditForm course={course} onDone={reload} /> : null}
      </Card>

      {message ? <div className="rounded-[10px] border-2 border-ink bg-vital-red p-3 text-sm font-bold">{message}</div> : null}

      <AddChapterForm courseId={course.id} onCreated={reload} />

      <section className="grid gap-4">
        {course.chapters?.length ? (
          course.chapters.map((chapter, index) => {
            const isOpen = openChapters.has(chapter.id);
            return (
              <Card key={chapter.id} className="p-0">
                <div className="flex items-center justify-between gap-3 border-b-2 border-ink p-4 sm:p-5">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => {
                      toggle(setOpenChapters, chapter.id);
                    }}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                    <span className="shrink-0 font-mono text-xs font-bold text-ink/60">Ch-{chapter.order_index ?? index + 1}</span>
                    <span className="min-w-0 truncate font-display text-xl font-bold">{chapter.title}</span>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="secondary" onClick={() => toggle(setOpenChapters, chapter.id)}>
                      {isOpen ? 'Close' : 'Open'}
                    </Button>
                  </div>
                </div>
                {isOpen ? (
                  <div className="grid gap-4 p-4 sm:p-5">
                    <ChapterEditForm chapter={chapter} onDone={reload} />
                    <AddTopicForm chapterId={chapter.id} onCreated={reload} />
                    <div className="grid gap-2">
                      {chapter.topics?.length ? (
                        chapter.topics.map((topic, topicIndex) => (
                          <TopicRow
                            key={topic.id}
                            topic={topic}
                            index={topicIndex}
                            items={topicItems[topic.id]}
                            isOpen={openTopics.has(topic.id)}
                            onToggle={() => {
                              toggle(setOpenTopics, topic.id);
                              if (!openTopics.has(topic.id)) {
                                loadTopicItems(topic.id);
                              }
                            }}
                            onDeleted={reload}
                            onChanged={reload}
                          />
                        ))
                      ) : (
                        <p className="rounded-[10px] border-2 border-dashed border-ink p-3 text-sm font-semibold text-ink/70">
                          No topics in this chapter yet.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })
        ) : (
          <Card tint="yellow">
            <h2 className="font-display text-2xl font-bold">No chapters yet.</h2>
            <p className="mt-2 font-semibold">Add the first chapter below.</p>
          </Card>
        )}
      </section>
    </div>
  );
}

function CourseEditForm({ course, onDone }: { course: Course; onDone: () => Promise<void> | void }) {
  const [form, setForm] = useState({
    title: course.title,
    slug: course.slug,
    description: course.description ?? '',
    is_published: course.is_published,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);
    try {
      await api.updateCourse(course.id, {
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        is_published: form.is_published,
      });
      await onDone();
      setMessage('Course updated.');
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        setErrors(saveError.errors ?? {});
        setMessage(saveError.message);
      } else {
        setMessage('Update failed before the API could answer.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4 border-t-[3px] border-ink bg-paper-muted p-5 sm:p-6" onSubmit={onSubmit}>
      <h2 className="font-display text-xl font-bold">Edit course</h2>
      {message ? (
        <div className={`rounded-[10px] border-2 border-ink p-3 text-sm font-bold ${Object.keys(errors).length ? 'bg-vital-red' : 'bg-pulse-green'}`}>
          {message}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title" value={form.title} onChange={(value) => update('title', value)} error={errors.title?.[0]} />
        <FormField label="Slug" value={form.slug} onChange={(value) => update('slug', value)} error={errors.slug?.[0]} />
      </div>
      <FormField label="Description" value={form.description} onChange={(value) => update('description', value)} textarea error={errors.description?.[0]} />
      <label className="flex items-center gap-2 font-semibold">
        <input
          type="checkbox"
          className="h-5 w-5 border-2 border-ink"
          checked={form.is_published}
          onChange={(event) => update('is_published', event.target.checked)}
        />
        Published (visible to students)
      </label>
      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving' : 'Save course'}
        </Button>
      </div>
    </form>
  );
}

function AddChapterForm({ courseId, onCreated }: { courseId: number; onCreated: () => Promise<void> | void }) {
  const [form, setForm] = useState({ title: '', slug: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);
    try {
      await api.createChapter({
        course_id: courseId,
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description || null,
      });
      setForm({ title: '', slug: '', description: '' });
      await onCreated();
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        setErrors(saveError.errors ?? {});
        setMessage(saveError.message);
      } else {
        setMessage('Create failed before the API could answer.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h2 className="font-display text-xl font-bold">Add chapter</h2>
      {message ? <div className="mt-2 rounded-[10px] border-2 border-ink bg-vital-red p-3 text-sm font-bold">{message}</div> : null}
      <form className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={onSubmit}>
        <FormField label="Title" value={form.title} onChange={(value) => setForm((c) => ({ ...c, title: value, slug: c.slug || slugify(value) }))} error={errors.title?.[0]} />
        <FormField label="Slug" value={form.slug} onChange={(value) => setForm((c) => ({ ...c, slug: value }))} error={errors.slug?.[0]} />
        <FormField label="Description" value={form.description} onChange={(value) => setForm((c) => ({ ...c, description: value }))} error={errors.description?.[0]} />
        <div className="flex items-end">
          <Button type="submit" disabled={submitting} icon={<Plus className="h-4 w-4" />}>
            Add
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ChapterEditForm({ chapter, onDone }: { chapter: Chapter; onDone: () => Promise<void> | void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: chapter.title, slug: chapter.slug, description: chapter.description ?? '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);
    try {
      await api.updateChapter(chapter.id, {
        course_id: chapter.course_id,
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        order_index: chapter.order_index,
      });
      await onDone();
      setEditing(false);
      setMessage('');
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        setErrors(saveError.errors ?? {});
        setMessage(saveError.message);
      } else {
        setMessage('Update failed before the API could answer.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!window.confirm(`Delete chapter "${chapter.title}" and all its topics?`)) {
      return;
    }
    await api.deleteChapter(chapter.id);
    await onDone();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => setEditing(true)} icon={<Pencil className="h-4 w-4" />}>
          Edit
        </Button>
        <Button variant="secondary" onClick={onDelete} icon={<Trash2 className="h-4 w-4" />}>
          Delete
        </Button>
      </div>
    );
  }

  return (
    <form className="grid gap-3 rounded-[10px] border-2 border-ink bg-paper-muted p-4" onSubmit={onSave}>
      {message ? <div className="rounded-[10px] border-2 border-ink bg-vital-red p-3 text-sm font-bold">{message}</div> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Title" value={form.title} onChange={(value) => setForm((c) => ({ ...c, title: value }))} error={errors.title?.[0]} />
        <FormField label="Slug" value={form.slug} onChange={(value) => setForm((c) => ({ ...c, slug: value }))} error={errors.slug?.[0]} />
      </div>
      <FormField label="Description" value={form.description} onChange={(value) => setForm((c) => ({ ...c, description: value }))} textarea error={errors.description?.[0]} />
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={submitting}>
          Save
        </Button>
        <Button variant="secondary" type="button" onClick={() => setEditing(false)} icon={<X className="h-4 w-4" />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddTopicForm({ chapterId, onCreated }: { chapterId: number; onCreated: () => Promise<void> | void }) {
  const [form, setForm] = useState({ title: '', slug: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);
    try {
      await api.createTopic({
        chapter_id: chapterId,
        title: form.title,
        slug: form.slug || slugify(form.title),
      });
      setForm({ title: '', slug: '' });
      await onCreated();
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        setErrors(saveError.errors ?? {});
        setMessage(saveError.message);
      } else {
        setMessage('Create failed before the API could answer.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[10px] border-2 border-dashed border-ink p-4">
      {message ? <div className="mb-3 rounded-[10px] border-2 border-ink bg-vital-red p-3 text-sm font-bold">{message}</div> : null}
      <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={onSubmit}>
        <FormField label="Topic title" value={form.title} onChange={(value) => setForm((c) => ({ ...c, title: value, slug: c.slug || slugify(value) }))} error={errors.title?.[0]} />
        <FormField label="Slug" value={form.slug} onChange={(value) => setForm((c) => ({ ...c, slug: value }))} error={errors.slug?.[0]} />
        <div className="flex items-end">
          <Button type="submit" disabled={submitting} icon={<Plus className="h-4 w-4" />}>
            Add topic
          </Button>
        </div>
      </form>
    </div>
  );
}

function TopicRow({
  topic,
  index,
  items,
  isOpen,
  onToggle,
  onDeleted,
  onChanged,
}: {
  topic: Topic;
  index: number;
  items?: ContentItem[];
  isOpen: boolean;
  onToggle: () => void;
  onDeleted: () => Promise<void> | void;
  onChanged: () => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: topic.title, slug: topic.slug });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);
    try {
      await api.updateTopic(topic.id, {
        chapter_id: topic.chapter_id,
        title: form.title,
        slug: form.slug,
        order_index: topic.order_index,
      });
      await onChanged();
      setEditing(false);
      setMessage('');
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        setErrors(saveError.errors ?? {});
        setMessage(saveError.message);
      } else {
        setMessage('Update failed before the API could answer.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!window.confirm(`Delete topic "${topic.title}" and all its content?`)) {
      return;
    }
    await api.deleteTopic(topic.id);
    await onDeleted();
  }

  return (
    <div className="rounded-[10px] border-2 border-ink bg-paper">
      <div className="flex items-center justify-between gap-3 p-3">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={onToggle} aria-expanded={isOpen}>
          {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
          <span className="shrink-0 font-mono text-[11px] font-bold text-ink/60">{index + 1}.</span>
          <span className="min-w-0 truncate font-display font-bold">{topic.title}</span>
          {items ? <span className="shrink-0 font-mono text-[11px] font-bold text-ink/50">({items.length})</span> : null}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={() => setEditing((value) => !value)} icon={<Pencil className="h-4 w-4" />}>
            Edit
          </Button>
          <Button variant="secondary" onClick={onDelete} icon={<Trash2 className="h-4 w-4" />}>
            Delete
          </Button>
        </div>
      </div>
      {editing ? (
        <form className="grid gap-3 border-t-2 border-ink bg-paper-muted p-3" onSubmit={onSave}>
          {message ? <div className="rounded-[10px] border-2 border-ink bg-vital-red p-3 text-sm font-bold">{message}</div> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Title" value={form.title} onChange={(value) => setForm((c) => ({ ...c, title: value }))} error={errors.title?.[0]} />
            <FormField label="Slug" value={form.slug} onChange={(value) => setForm((c) => ({ ...c, slug: value }))} error={errors.slug?.[0]} />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={submitting}>
              Save
            </Button>
            <Button variant="secondary" type="button" onClick={() => setEditing(false)} icon={<X className="h-4 w-4" />}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
      {isOpen ? (
        <div className="grid gap-3 border-t-2 border-ink p-3">
          {items?.length ? (
            <div className="grid gap-2">
              {items.map((item) => (
                <ContentItemRow key={item.id} item={item} onChanged={onChanged} />
              ))}
            </div>
          ) : (
            <p className="rounded-[10px] border-2 border-dashed border-ink p-3 text-sm font-semibold text-ink/70">No content items yet.</p>
          )}
          <ContentItemForm topicId={topic.id} onCreated={onChanged} />
        </div>
      ) : null}
    </div>
  );
}

function ContentItemRow({ item, onChanged }: { item: ContentItem; onChanged: () => Promise<void> | void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: item.title ?? '',
    body: item.body ?? '',
    youtube_url: item.youtube_url ?? '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const typeLabel: Record<string, string> = { text: 'text', markdown: 'markdown', pdf: 'file', video: 'video', youtube: 'video' };
  const submitType: ContentType = item.type === 'youtube' ? 'video' : item.type;

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);
    try {
      await api.updateContentItem(
        item.id,
        {
          topic_id: item.topic_id,
          type: submitType,
          title: form.title,
          body: item.type === 'text' || item.type === 'markdown' ? form.body : undefined,
          youtube_url: item.type === 'video' ? form.youtube_url : undefined,
          order_index: item.order_index,
        },
        item.type === 'pdf' ? file ?? undefined : undefined,
      );
      await onChanged();
      setEditing(false);
      setMessage('');
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        setErrors(saveError.errors ?? {});
        setMessage(saveError.message);
      } else {
        setMessage('Update failed before the API could answer.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!window.confirm(`Delete content item "${item.title}"?`)) {
      return;
    }
    await api.deleteContentItem(item.id);
    await onChanged();
  }

  return (
    <div className="rounded-[8px] border-2 border-ink bg-paper-muted p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-full border-2 border-ink bg-chart-yellow px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
            {typeLabel[item.type] ?? item.type}
          </span>
          <span className="min-w-0 truncate text-sm font-bold">{item.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={() => setEditing((value) => !value)} icon={<Pencil className="h-4 w-4" />}>
            Edit
          </Button>
          <Button variant="secondary" onClick={onDelete} icon={<Trash2 className="h-4 w-4" />}>
            Delete
          </Button>
        </div>
      </div>
      {editing ? (
        <form className="mt-3 grid gap-3" onSubmit={onSave}>
          {message ? <div className="rounded-[10px] border-2 border-ink bg-vital-red p-3 text-sm font-bold">{message}</div> : null}
          <FormField label="Title" value={form.title} onChange={(value) => setForm((c) => ({ ...c, title: value }))} error={errors.title?.[0]} />
          {item.type === 'text' || item.type === 'markdown' ? (
            <FormField label="Body" value={form.body} onChange={(value) => setForm((c) => ({ ...c, body: value }))} textarea error={errors.body?.[0]} />
          ) : null}
          {item.type === 'video' ? (
            <FormField label="YouTube URL" type="url" value={form.youtube_url} onChange={(value) => setForm((c) => ({ ...c, youtube_url: value }))} error={errors.youtube_url?.[0]} />
          ) : null}
          {item.type === 'pdf' ? (
            <label className="grid gap-2 font-semibold">
              Replace file (optional)
              <input
                type="file"
                accept=".pdf,.ppt,.pptx"
                className="min-h-12 border-2 border-ink bg-paper px-3 py-2 shadow-hard"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              {errors.file ? <span className="text-sm font-bold text-vital-red">{errors.file[0]}</span> : null}
            </label>
          ) : null}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={submitting}>
              Save
            </Button>
            <Button variant="secondary" type="button" onClick={() => setEditing(false)} icon={<X className="h-4 w-4" />}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function ContentItemForm({ topicId, onCreated }: { topicId: number; onCreated: () => Promise<void> | void }) {
  const [type, setType] = useState<ContentType>('text');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const types: { value: ContentType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'File' },
  ];

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);
    try {
      await api.createContentItem(
        {
          topic_id: topicId,
          type,
          title,
          body: type === 'text' || type === 'markdown' ? body : undefined,
          youtube_url: type === 'video' ? youtubeUrl : undefined,
        },
        type === 'pdf' ? file ?? undefined : undefined,
      );
      setTitle('');
      setBody('');
      setYoutubeUrl('');
      setFile(null);
      await onCreated();
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        setErrors(saveError.errors ?? {});
        setMessage(saveError.message);
      } else {
        setMessage('Create failed before the API could answer.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="rounded-[8px] border-2 border-dashed border-ink bg-paper p-3" onSubmit={onSubmit}>
      <h3 className="font-display text-sm font-bold uppercase">Add content item</h3>
      {message ? <div className="mt-2 rounded-[10px] border-2 border-ink bg-vital-red p-3 text-sm font-bold">{message}</div> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {types.map((option) => (
          <label key={option.value} className="flex items-center gap-2 font-semibold">
            <input
              type="radio"
              name="content-type"
              className="h-4 w-4 border-2 border-ink"
              checked={type === option.value}
              onChange={() => {
                setType(option.value);
                setErrors({});
                setMessage('');
              }}
            />
            <span className={`rounded-[8px] border-2 border-ink px-2 py-0.5 font-mono text-[11px] font-bold uppercase ${type === option.value ? 'bg-chart-yellow' : 'bg-paper'}`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 grid gap-3">
        <FormField label="Title" value={title} onChange={setTitle} error={errors.title?.[0]} />
        {type === 'text' || type === 'markdown' ? (
          <FormField label="Body" value={body} onChange={setBody} textarea error={errors.body?.[0]} />
        ) : null}
        {type === 'video' ? (
          <FormField label="YouTube URL" type="url" value={youtubeUrl} onChange={setYoutubeUrl} placeholder="https://youtube.com/watch?v=..." error={errors.youtube_url?.[0]} />
        ) : null}
        {type === 'pdf' ? (
          <label className="grid gap-2 font-semibold">
            File
            <input
              type="file"
              accept=".pdf,.ppt,.pptx"
              className="min-h-12 border-2 border-ink bg-paper px-3 py-2 shadow-hard"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {errors.file ? <span className="text-sm font-bold text-vital-red">{errors.file[0]}</span> : null}
          </label>
        ) : null}
        <div>
          <Button type="submit" disabled={submitting} icon={<Plus className="h-4 w-4" />}>
            {submitting ? 'Adding' : 'Add item'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
