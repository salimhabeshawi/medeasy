import { BookOpen, Clock3, MoveRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { courseCompletion, topicStatus } from '../lib/progress';
import { fuzzyRank } from '../lib/fuzzy';
import type { ContinueTopic, Course } from '../types/api';
import { ButtonLink } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBlock } from '../components/ErrorBlock';
import { ProgressBar } from '../components/ProgressBar';
import { SearchInput } from '../components/SearchInput';
import { VitalsStrip } from '../components/VitalsStrip';

const streakDays = [
  { day: 'M', hit: true },
  { day: 'T', hit: true },
  { day: 'W', hit: true },
  { day: 'T', hit: false },
  { day: 'F', hit: true },
  { day: 'S', hit: true },
  { day: 'S', hit: true },
];

const folderTabs = ['folder-tab-yellow', 'folder-tab-green', 'folder-tab-blue', 'folder-tab-red'];

export function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [continueTopic, setContinueTopic] = useState<ContinueTopic | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [continueError, setContinueError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [courseData, continueData] = await Promise.allSettled([api.courses(), api.continueTopic()]);

        if (!active) {
          return;
        }

        if (courseData.status === 'fulfilled') {
          setCourses(courseData.value);
        } else {
          throw courseData.reason;
        }

        if (continueData.status === 'fulfilled') {
          if (continueData.value?.topic) {
            setContinueTopic(continueData.value);
          }
        } else if (continueData.reason instanceof ApiError) {
          setContinueError('No saved study position yet. Open a topic to begin your next pass.');
        } else {
          setContinueError('Continue endpoint did not answer.');
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Dashboard data did not load.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const readCourses = useMemo(
    () =>
      courses.filter((course) =>
        (course.chapters ?? []).some((chapter) =>
          (chapter.topics ?? []).some((topic) => topicStatus(topic) !== 'not_started'),
        ),
      ),
    [courses],
  );

  const searchResults = useMemo(
    () => fuzzyRank(query, readCourses, (course) => `${course.title} ${course.description ?? ''}`),
    [query, readCourses],
  );

  if (loading) {
    return null;
  }

  if (error) {
    return <ErrorBlock message={error} />;
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <section className="chart-panel overflow-hidden">
        <div className="p-5 sm:p-6">
          <ProgressBar
            label="all courses"
            value={courses.length ? courses.reduce((sum, course) => sum + courseCompletion(course), 0) / courses.length : 0}
          />
          <p className="mt-2 font-mono text-sm font-bold">
            {courses.length} course{courses.length === 1 ? '' : 's'} total
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Card className="bg-paper">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-kicker">Continue where you left off</p>
              {continueTopic ? (
                <>
                  <h1 className="mt-2 font-display text-3xl font-bold">{continueTopic.topic.title}</h1>
                  <p className="mt-2 font-semibold">
                    {continueTopic.course.title} / {continueTopic.chapter.title}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="mt-2 font-display text-3xl font-bold">No incomplete topic reported.</h1>
                  <p className="mt-2 font-semibold">
                    {continueError || 'Open a course and pick the next topic in the list.'}
                  </p>
                </>
              )}
            </div>
            {continueTopic ? (
              <ButtonLink to={`/topics/${continueTopic.topic.id}`} icon={<MoveRight className="h-4 w-4" />}>
                Jump back in
              </ButtonLink>
            ) : (
              <ButtonLink to="/courses" variant="yellow" icon={<BookOpen className="h-4 w-4" />}>
                View courses
              </ButtonLink>
            )}
          </div>
        </Card>
        <StreakCard />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs font-bold uppercase">Course progress</p>
            <h2 className="font-display text-3xl font-bold">Current readouts</h2>
          </div>
          <Link className="font-display text-sm font-bold uppercase underline decoration-2 underline-offset-4" to="/courses">
            All courses
          </Link>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search current readouts…" className="mb-5 max-w-md" />
        {searchResults.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {searchResults.map((course, index) => (
              <Link key={course.id} to={`/courses/${course.slug}`} className="block">
                <Card className={`folder-card ${folderTabs[index % folderTabs.length]} grid gap-4`}>
                  <div>
                    <h3 className="font-display text-xl font-bold">{course.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold">{course.description}</p>
                  </div>
                  <ProgressBar value={courseCompletion(course)} label="completion" />
                </Card>
              </Link>
            ))}
          </div>
        ) : readCourses.length ? (
          <Card tint="yellow">
            <h3 className="font-display text-2xl font-bold">No matches for “{query}”.</h3>
            <p className="mt-2 font-semibold">Try a shorter or different query, or clear the search.</p>
          </Card>
        ) : (
          <Card tint="yellow">
            <h3 className="font-display text-2xl font-bold">No courses yet.</h3>
            <p className="mt-2 font-semibold">Ask an admin to publish the first course, then refresh this dashboard.</p>
          </Card>
        )}
      </section>
    </div>
  );
}

function StreakCard() {
  return (
    <Card className="relative overflow-hidden bg-paper">
      {/* TODO: wire to streaks API once Phase 3 ships */}
      <div className="absolute inset-x-0 top-16">
        <VitalsStrip compact />
      </div>
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="section-kicker">Study streak</p>
          <span className="rounded-full border-2 border-ink bg-chart-yellow px-3 py-1 font-mono text-xs font-bold">preview</span>
        </div>
        <div className="mt-4 inline-flex rounded-[12px] border-[3px] border-ink bg-vital-red px-4 py-3 font-mono text-4xl font-bold shadow-hard">6</div>
        <p className="mt-3 flex items-center gap-2 font-display text-xl font-bold">
          <Clock3 className="h-5 w-5" aria-hidden="true" />
          study days
        </p>
        <div className="mt-6 grid grid-cols-7 gap-2">
          {streakDays.map((day, index) => (
            <div
              key={`${day.day}-${index}`}
              className={`rounded-[8px] border-2 border-ink py-2 text-center font-mono text-sm font-bold ${
                day.hit ? 'bg-pulse-green' : 'bg-paper'
              }`}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
