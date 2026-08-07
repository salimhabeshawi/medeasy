import { Layers } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { courseCompletion, courseTopicCounts } from '../lib/progress';
import { fuzzyRank } from '../lib/fuzzy';
import type { Course } from '../types/api';
import { ButtonLink } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBlock } from '../components/ErrorBlock';
import { ProgressBar } from '../components/ProgressBar';
import { SearchInput } from '../components/SearchInput';

const folderTabs = ['folder-tab-yellow', 'folder-tab-green', 'folder-tab-blue', 'folder-tab-red'];

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
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

  const results = useMemo(
    () => fuzzyRank(query, courses, (course) => `${course.title} ${course.description ?? ''}`),
    [query, courses],
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
            <p className="mt-2 max-w-2xl font-semibold">Choose a course, open the chapter list, and work topic by topic.</p>
          </div>
          <div className="rounded-[10px] border-2 border-ink bg-paper-muted px-4 py-3 font-mono text-2xl font-bold shadow-hard">
            {results.length}
          </div>
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
                  <p className="mt-2 min-h-12 text-sm font-semibold">{course.description || 'No description entered.'}</p>
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
      ) : courses.length ? (
        <Card tint="yellow">
          <h2 className="font-display text-2xl font-bold">No matches for “{query}”.</h2>
          <p className="mt-2 font-semibold">Try a shorter or different query, or clear the search.</p>
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
