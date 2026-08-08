import { Layers } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { courseCompletion, courseTopicCounts } from '../lib/progress';
import { fuzzyRank } from '../lib/fuzzy';
import type { Course } from '../types/api';
import { useAuth } from '../providers/auth-context';
import { ButtonLink } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBlock } from '../components/ErrorBlock';
import { ProgressBar } from '../components/ProgressBar';
import { SearchInput } from '../components/SearchInput';

const folderTabs = ['folder-tab-yellow', 'folder-tab-green', 'folder-tab-blue', 'folder-tab-red'];

export function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [year, setYear] = useState<number | null>(user?.year ?? null);
  const [semester, setSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const filtered = useMemo(
    () =>
      courses.filter(
        (course) =>
          (year === null || course.year === year) && (semester === null || course.semester === semester),
      ),
    [courses, year, semester],
  );

  const results = useMemo(
    () => fuzzyRank(query, filtered, (course) => `${course.title} ${course.description ?? ''}`),
    [query, filtered],
  );

  if (loading) {
    return null;
  }

  if (error) {
    return <ErrorBlock message={error} />;
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <section className="chart-panel p-5 sm:p-6">
        <span className="section-kicker">Course library</span>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Medical courses</h1>
            <p className="mt-2 max-w-2xl font-semibold">
              {year
                ? `Your year tier: Year ${year}. You can browse every year below.`
                : 'Browsing the full library. Choose a year to scope it down.'}
            </p>
          </div>
          <div className="rounded-[10px] border-2 border-ink bg-paper-muted px-4 py-3 font-mono text-2xl font-bold shadow-hard">
            {results.length}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="grid gap-1 font-semibold">
            <span className="font-display text-xs font-bold uppercase">Year</span>
            <select
              value={year ?? ''}
              onChange={(event) => setYear(event.target.value === '' ? null : Number(event.target.value))}
              className="min-h-10 border-2 border-ink bg-paper px-3 shadow-hard"
            >
              <option value="">All years</option>
              {Array.from({ length: 7 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  Year {value}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 font-semibold">
            <span className="font-display text-xs font-bold uppercase">Semester</span>
            <select
              value={semester ?? ''}
              onChange={(event) => setSemester(event.target.value === '' ? null : Number(event.target.value))}
              className="min-h-10 border-2 border-ink bg-paper px-3 shadow-hard"
            >
              <option value="">All semesters</option>
              {[1, 2].map((value) => (
                <option key={value} value={value}>
                  Semester {value}
                </option>
              ))}
            </select>
          </label>
          {(year !== null || semester !== null) && user?.year && user?.semester ? (
            <button
              type="button"
              className="pressable min-h-10 rounded-[10px] border-2 border-ink bg-chart-yellow px-3 font-display text-xs font-bold uppercase shadow-hard"
              onClick={() => {
                setYear(user.year ?? null);
                setSemester(null);
              }}
            >
              My year
            </button>
          ) : null}
          {(year !== null || semester !== null) ? (
            <button
              type="button"
              className="pressable min-h-10 rounded-[10px] border-2 border-ink bg-paper px-3 font-display text-xs font-bold uppercase shadow-hard"
              onClick={() => {
                setYear(null);
                setSemester(null);
              }}
            >
              All courses
            </button>
          ) : null}
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search courses…" className="mt-4 max-w-md" />
      </section>
      {results.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((course, index) => {
            const counts = courseTopicCounts(course);
            return (
              <Card key={course.id} className={`folder-card ${folderTabs[index % folderTabs.length]} grid content-between gap-5 bg-paper`}>
                <div>
                  <div className="mb-4 inline-flex rounded-[10px] border-2 border-ink bg-scrub-blue p-3 text-paper shadow-hard">
                    <Layers aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl font-bold">{course.title}</h2>
                  <div className="mt-2 inline-block rounded-full border-2 border-ink bg-paper-muted px-2 py-0.5 font-mono text-[11px] font-bold">
                    Year {course.year} · Semester {course.semester}
                  </div>
                  <p className="mt-2 min-h-8 text-sm font-semibold">{course.description || 'No description entered.'}</p>
                </div>
                <div className="grid gap-4">
                  <div className="font-mono text-sm font-bold">
                    {counts.completed}/{counts.total} topics complete
                  </div>
                  <ProgressBar value={courseCompletion(course)} />
                  <ButtonLink to={`/courses/${course.slug}`} variant="blue">
                    Open course
                  </ButtonLink>
                </div>
              </Card>
            );
          })}
        </div>
      ) : filtered.length ? (
        <Card tint="yellow">
          <h2 className="font-display text-2xl font-bold">No matches for “{query}”.</h2>
          <p className="mt-2 font-semibold">Try a shorter or different query, or clear the search.</p>
        </Card>
      ) : courses.length ? (
        <Card tint="yellow">
          <h2 className="font-display text-2xl font-bold">No courses in that year yet.</h2>
          <p className="mt-2 font-semibold">Switch to another year or view all courses.</p>
        </Card>
      ) : (
        <Card tint="yellow">
          <h2 className="font-display text-2xl font-bold">No courses are published.</h2>
          <p className="mt-2 font-semibold">Check back after the content library has at least one active course.</p>
        </Card>
      )}
    </div>
  );
}
