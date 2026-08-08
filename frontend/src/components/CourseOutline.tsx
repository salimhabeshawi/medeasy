import { BookOpen, ChevronDown, ChevronRight, PanelLeftClose } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { TopicOutline } from '../types/api';
import { Card } from './Card';

export function CourseOutline({
  outline,
  onCollapse,
}: {
  outline: TopicOutline;
  onCollapse?: () => void;
}) {
  const [openChapters, setOpenChapters] = useState<Set<number>>(() => new Set(outline.chapters.map((chapter) => chapter.id)));

  function toggleChapter(chapterId: number) {
    setOpenChapters((current) => {
      const next = new Set(current);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }

  return (
    <Card className="w-full min-w-0 overflow-hidden p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <NavLink
          className="flex min-w-0 items-center gap-2 font-display text-base font-bold leading-tight hover:underline"
          to={`/courses/${outline.course.slug}`}
        >
          <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{outline.course.title}</span>
        </NavLink>
        {onCollapse ? (
          <button
            type="button"
            className="shrink-0 rounded-[8px] border-2 border-ink bg-paper p-1.5 shadow-hard transition-transform hover:translate-y-0.5"
            onClick={onCollapse}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2">
        {outline.chapters.map((chapter) => {
          const isOpen = openChapters.has(chapter.id);
          return (
            <div key={chapter.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-[8px] border-2 border-ink bg-paper-muted px-2 py-1.5 text-left font-display text-xs font-bold uppercase hover:bg-chart-yellow"
                onClick={() => toggleChapter(chapter.id)}
                aria-expanded={isOpen}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="shrink-0 font-mono font-bold text-ink/60">Ch-{chapter.order_index}</span>
                  <span className="min-w-0 truncate">{chapter.title}</span>
                </span>
                {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
              </button>
              {isOpen ? (
                <div className="mt-1 grid grid-cols-1 gap-1 pl-2">
                  {chapter.topics.map((topic) => (
                    <NavLink
                      key={topic.id}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-[8px] border-2 border-transparent px-2 py-1.5 text-sm font-semibold leading-snug transition-colors ${
                          isActive ? 'border-ink bg-chart-yellow' : 'hover:bg-paper-muted'
                        }`
                      }
                      to={`/topics/${topic.id}`}
                    >
                      <span className="font-mono text-[11px] font-bold text-ink/60">{topic.order_index}</span>
                      <span className="min-w-0 flex-1 truncate">{topic.title}</span>
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
