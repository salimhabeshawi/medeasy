import { ArrowLeft, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../providers/auth-context';
import { api } from '../lib/api';
import { courseCompletion, topicStatus } from '../lib/progress';
import type { Chapter, Course } from '../types/api';
import { Button } from '../components/Button';
import { ButtonLink } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBlock } from '../components/ErrorBlock';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';

export function CourseDetailPage() {
  const { courseSlug } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    if (!courseSlug) {
      setError('Course slug is missing from the route.');
      setLoading(false);
      return;
    }

    api
      .course(courseSlug)
      .then((data) => {
        if (active) {
          setCourse(data);
          setOpenChapters(new Set(data.chapters?.slice(0, 1).map((chapter) => chapter.id) ?? []));
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

  function toggleChapter(chapter: Chapter) {
    setOpenChapters((current) => {
      const next = new Set(current);
      if (next.has(chapter.id)) {
        next.delete(chapter.id);
      } else {
        next.add(chapter.id);
      }
      return next;
    });
  }

  if (loading) {
    return null;
  }

  if (error || !course) {
    return <ErrorBlock message={error || 'Course was not returned by the API.'} />;
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <Link
        className="flex w-fit items-center gap-2 font-display text-sm font-bold uppercase underline decoration-2 underline-offset-4"
        to="/courses"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        All courses
      </Link>
      <Card className="overflow-hidden p-0">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="p-5 sm:p-6">
            <h1 className="font-display text-4xl font-bold">{course.title}</h1>
            <p className="mt-3 max-w-3xl font-semibold">{course.description || 'No description entered.'}</p>
          </div>
          <div className="p-5 sm:p-6">
            <ProgressBar value={courseCompletion(course)} label="course completion" />
          </div>
        </div>
      </Card>

      {user?.role === 'admin' ? (
        <Card tint="yellow" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Admin content controls</h2>
            <p className="text-sm font-semibold">Create endpoints exist, but this workflow is not wired in the UI yet.</p>
          </div>
          {/* TODO: wire create chapter/topic modals to admin endpoints when the authoring workflow is designed. */}
          <Button disabled variant="secondary" icon={<Plus className="h-4 w-4" />}>
            Add chapter/topic
          </Button>
        </Card>
      ) : null}

      <section className="grid gap-4">
        {course.chapters?.length ? (
          course.chapters.map((chapter) => {
            const isOpen = openChapters.has(chapter.id);
            return (
              <Card key={chapter.id} className="folder-card folder-tab-blue p-0">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
                  onClick={() => toggleChapter(chapter)}
                >
                  <span>
                    <span className="font-mono text-xs font-bold">CH {chapter.order_index}</span>
                    <span className="block font-display text-2xl font-bold">{chapter.title}</span>
                  </span>
                  {isOpen ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                </button>
                {isOpen ? (
                  <div className="border-t-[3px] border-ink">
                    {chapter.topics?.length ? (
                      chapter.topics.map((topic) => (
                        <div
                          className="grid gap-3 border-b-2 border-ink p-4 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:pl-12"
                          key={topic.id}
                        >
                          <div>
                            <div className="font-mono text-xs font-bold">TOPIC {topic.order_index}</div>
                            <h3 className="font-display text-xl font-bold">{topic.title}</h3>
                          </div>
                          <StatusBadge status={topicStatus(topic)} />
                          <ButtonLink to={`/topics/${topic.id}`} variant="secondary">
                            Open
                          </ButtonLink>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 font-semibold">This chapter has no topics yet.</div>
                    )}
                  </div>
                ) : null}
              </Card>
            );
          })
        ) : (
          <Card tint="yellow">
            <h2 className="font-display text-2xl font-bold">No chapters yet.</h2>
            <p className="mt-2 font-semibold">An admin needs to add chapters before this course is study-ready.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
