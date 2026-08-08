import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { slugify } from '../lib/slugify';
import { useTitleSlug } from '../lib/use-title-slug';
import type { Course } from '../types/api';
import { Button, ButtonLink } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBlock } from '../components/ErrorBlock';
import { FormField } from '../components/admin/FormField';
import { ProgressBar } from '../components/ProgressBar';

export function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', slug: '', description: '', year: 1, semester: 1 });
  const slugSync = useTitleSlug();
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [flash, setFlash] = useState<{ text: string; kind: 'success' | 'error' } | null>(null);
  const flashTimer = useRef<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  function showFlash(text: string, kind: 'success' | 'error' = 'success') {
    setFlash({ text, kind });
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 3000);
  }

  useEffect(() => {
    return () => window.clearTimeout(flashTimer.current);
  }, []);

  useEffect(() => {
    let active = true;

    api
      .courses()
      .then((data) => {
        if (active) {
          setCourses(data);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Courses did not load.');
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
  }, []);

  function update(field: keyof typeof form, value: string | number | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const created = await api.createCourse({
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description || null,
        year: form.year,
        semester: form.semester,
      });
      setCourses((current) => [created, ...current]);
      setForm({ title: '', slug: '', description: '', year: 1, semester: 1 });
      slugSync.resetSlugSync();
      showFlash(`"${created.title}" saved as a draft. Publish it to share it with students.`);
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        setFormErrors(saveError.errors ?? {});
        showFlash(saveError.message, 'error');
      } else {
        showFlash('The create request failed before the API could answer.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(course: Course) {
    if (!window.confirm(`Delete "${course.title}" and all its chapters and topics?`)) {
      return;
    }

    try {
      await api.deleteCourse(course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
    } catch (deleteError) {
      showFlash(deleteError instanceof Error ? deleteError.message : 'Delete failed.', 'error');
    }
  }

  if (loading) {
    return null;
  }

  if (error) {
    return <ErrorBlock message={error} />;
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <section className="chart-panel p-5 sm:p-6">
        <span className="section-kicker">Admin console</span>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Study command center</h1>
        <p className="mt-2 max-w-2xl font-semibold">
          Create and organize courses, then open one to manage its chapters, topics, and content.
        </p>
        <div className="mt-6 max-w-md">
          <ProgressBar
            label="Library coverage"
            value={courses.length ? (courses.filter((course) => course.is_published).length / courses.length) * 100 : 0}
          />
          <p className="mt-2 font-mono text-sm font-bold">
            {courses.length} course{courses.length === 1 ? '' : 's'} total ·{' '}
            {courses.filter((course) => course.is_published).length} published
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Card className="h-fit">
          <h2 className="font-display text-2xl font-bold">New course</h2>
          {flash ? (
            <div className={`mt-3 rounded-[10px] border-2 border-ink p-3 text-sm font-bold ${flash.kind === 'success' ? 'bg-pulse-green' : 'bg-vital-red'}`}>
              {flash.text}
            </div>
          ) : null}
          <form className="mt-4 grid gap-4" onSubmit={onCreate}>
            <FormField
              label="Title"
              value={form.title}
              onChange={(value) => setForm((current) => slugSync.updateTitle(current, value))}
              placeholder="e.g. Physiology I"
              error={formErrors.title?.[0]}
            />
            <FormField
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm((current) => slugSync.updateSlug(current, value))}
              placeholder="e.g. physiology-i"
              error={formErrors.slug?.[0]}
            />
            <FormField
              label="Description"
              value={form.description}
              onChange={(value) => update('description', value)}
              textarea
              error={formErrors.description?.[0]}
            />
            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-2 font-semibold">
                Year
                <select
                  className="min-h-12 border-2 border-ink bg-paper px-3 shadow-hard"
                  value={form.year}
                  onChange={(event) => update('year', Number(event.target.value))}
                >
                  {Array.from({ length: 7 }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>
                      Year {value}
                    </option>
                  ))}
                </select>
                {formErrors.year?.[0] ? <span className="text-sm font-bold text-vital-red">{formErrors.year[0]}</span> : null}
              </label>
              <label className="grid gap-2 font-semibold">
                Semester
                <select
                  className="min-h-12 border-2 border-ink bg-paper px-3 shadow-hard"
                  value={form.semester}
                  onChange={(event) => update('semester', Number(event.target.value))}
                >
                  {[1, 2].map((value) => (
                    <option key={value} value={value}>
                      Semester {value}
                    </option>
                  ))}
                </select>
                {formErrors.semester?.[0] ? (
                  <span className="text-sm font-bold text-vital-red">{formErrors.semester[0]}</span>
                ) : null}
              </label>
            </div>
            <Button type="submit" disabled={submitting} icon={<Plus className="h-4 w-4" />}>
              {submitting ? 'Creating' : 'Create course'}
            </Button>
          </form>
        </Card>

        <section className="grid gap-4 content-start">
          {courses.length ? (
            courses.map((course) => (
              <Card key={course.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="shrink-0 rounded-[10px] border-2 border-ink bg-scrub-blue p-2.5 text-paper shadow-hard">
                    <BookOpen aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-bold">{course.title}</h3>
                    <p className="truncate text-sm font-semibold text-ink/70">/{course.slug}</p>
                    {course.description ? <p className="mt-1 line-clamp-2 text-sm font-semibold">{course.description}</p> : null}
                    <span
                      className={`mt-2 inline-block rounded-full border-2 border-ink px-2 py-0.5 font-mono text-[11px] font-bold ${
                        course.is_published ? 'bg-pulse-green' : 'bg-chart-yellow'
                      }`}
                    >
                      {course.is_published ? 'published' : 'draft'}
                    </span>
                    <span className="mt-2 ml-2 inline-block rounded-full border-2 border-ink bg-paper-muted px-2 py-0.5 font-mono text-[11px] font-bold">
                      Y{course.year} / S{course.semester}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ButtonLink to={`/admin/courses/${course.slug}`} variant="blue" icon={<Pencil className="h-4 w-4" />}>
                    Manage
                  </ButtonLink>
                  <Button variant="secondary" onClick={() => onDelete(course)} icon={<Trash2 className="h-4 w-4" />}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card tint="yellow">
              <h3 className="font-display text-2xl font-bold">No courses yet.</h3>
              <p className="mt-2 font-semibold">Use the form on the left to publish the first course.</p>
            </Card>
          )}
        </section>
      </section>
    </div>
  );
}
