import { ArrowLeft, CheckCircle2, ExternalLink, FileText, PanelLeftOpen, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { topicStatus } from '../lib/progress';
import type { ContentItem, Topic, TopicOutline } from '../types/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CourseOutline } from '../components/CourseOutline';
import { ErrorBlock } from '../components/ErrorBlock';
import { StatusBadge } from '../components/StatusBadge';

export function TopicPage() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [outline, setOutline] = useState<TopicOutline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [resizing, setResizing] = useState(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(300);

  const SIDEBAR_MIN = 220;
  const SIDEBAR_MAX = 480;

  function handleResizeStart(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    setResizing(true);
    resizeStartX.current = event.clientX;
    resizeStartWidth.current = sidebarWidth;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleResizeMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!resizing) {
      return;
    }
    const maxWidth = Math.min(SIDEBAR_MAX, window.innerWidth - 200);
    const next = Math.max(SIDEBAR_MIN, Math.min(maxWidth, resizeStartWidth.current + (event.clientX - resizeStartX.current)));
    setSidebarWidth(next);
  }

  function handleResizeEnd(event: React.PointerEvent<HTMLDivElement>) {
    setResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  useEffect(() => {
    let active = true;

    if (!topicId) {
      setError('Topic id is missing from the route.');
      setLoading(false);
      return;
    }

    Promise.allSettled([api.topic(topicId), api.topicOutline(topicId)])
      .then(([topicResult, outlineResult]) => {
        if (!active) {
          return;
        }

        if (topicResult.status === 'fulfilled') {
          setTopic(topicResult.value);
        } else {
          setError(topicResult.reason instanceof Error ? topicResult.reason.message : 'Topic did not load.');
        }

        if (outlineResult.status === 'fulfilled') {
          setOutline(outlineResult.value);
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
  }, [topicId]);

  const sortedItems = useMemo(
    () => [...(topic?.content_items ?? [])].sort((first, second) => first.order_index - second.order_index),
    [topic?.content_items],
  );

  async function toggleComplete() {
    if (!topic || !topicId) {
      return;
    }

    const wasComplete = topicStatus(topic) === 'complete';
    const optimisticTopic = { ...topic, is_complete: !wasComplete, status: wasComplete ? 'in_progress' : 'complete' } as Topic;
    setTopic(optimisticTopic);
    setProgressMessage('');
    setSaving(true);

    try {
      const updated = wasComplete ? await api.incompleteTopic(topicId) : await api.completeTopic(topicId);
      setTopic({ ...optimisticTopic, ...updated });
    } catch (saveError) {
      setTopic(topic);
      if (saveError instanceof ApiError) {
        setProgressMessage(`Progress endpoint returned ${saveError.status}. Add topic progress routes to persist this toggle.`);
      } else {
        setProgressMessage('Progress update did not reach the API.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return null;
  }

  if (error || !topic) {
    return <ErrorBlock message={error || 'Topic was not returned by the API.'} />;
  }

  const status = topicStatus(topic);
  const outlineVisible = sidebarOpen && outline !== null;
  const articleStyle = outlineVisible ? ({ '--sidebar-w': `${sidebarWidth}px` } as CSSProperties) : undefined;

  return (
    <article
      className={`grid gap-6 ${outlineVisible ? 'lg:[grid-template-columns:var(--sidebar-w)_minmax(0,1fr)]' : ''} ${resizing ? 'select-none' : ''}`}
      style={articleStyle}
    >
      {outlineVisible && outline ? (
        <aside className="relative flex items-start min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="min-w-0 flex-1">
            <CourseOutline outline={outline} onCollapse={() => setSidebarOpen(false)} />
          </div>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            title="Drag to resize"
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
            className="absolute inset-y-0 right-0 hidden w-3 cursor-col-resize touch-none lg:block"
          />
        </aside>
      ) : null}
      <div className="grid gap-6 content-start lg:mx-auto lg:w-full lg:max-w-4xl">
        <Link
          className="flex w-fit items-center gap-2 font-display text-sm font-bold uppercase underline decoration-2 underline-offset-4"
          to="/courses"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          All courses
        </Link>
        {!sidebarOpen ? (
          <div className="flex justify-start">
            <button
              type="button"
              className="pressable inline-flex min-h-11 items-center gap-2 rounded-[10px] border-2 border-ink bg-paper px-3 py-2 font-display text-xs font-bold uppercase shadow-hard"
              onClick={() => setSidebarOpen(true)}
              aria-label="Expand sidebar"
              aria-expanded={false}
            >
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Outline</span>
            </button>
          </div>
        ) : null}
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="p-5 sm:p-6">
              <h1 className="font-display text-4xl font-bold">{topic.title}</h1>
            </div>
            <div className="p-5 sm:p-6">
              <StatusBadge status={status} />
            </div>
          </div>
        </Card>

        {sortedItems.length ? (
          <div className="grid gap-5">
            {sortedItems.map((item) => (
              <ContentBlock item={item} key={item.id} />
            ))}
          </div>
        ) : (
          <Card tint="yellow">
            <h2 className="font-display text-2xl font-bold">No content items yet.</h2>
            <p className="mt-2 font-semibold">This topic needs text, markdown, a PDF, or a YouTube lesson before it is study-ready.</p>
          </Card>
        )}

        <Card className="flex flex-col gap-4 bg-paper-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Progress switch</h2>
            <p className="text-sm font-semibold">{progressMessage || 'Mark this topic when your pass is complete.'}</p>
          </div>
          <Button
            variant={status === 'complete' ? 'secondary' : 'green'}
            onClick={toggleComplete}
            disabled={saving}
            icon={status === 'complete' ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          >
            {status === 'complete' ? 'Mark incomplete' : 'Mark complete'}
          </Button>
        </Card>
      </div>
    </article>
  );
}

function ContentBlock({ item }: { item: ContentItem }) {
  const title = item.title || `Item ${item.order_index}`;

  if (item.type === 'markdown' || item.type === 'text') {
    return (
      <Card>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <div className="markdown-body mt-4 text-base leading-7">
          <ReactMarkdown>{item.body ?? ''}</ReactMarkdown>
        </div>
      </Card>
    );
  }

  if (item.type === 'pdf') {
    return (
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-[10px] border-2 border-ink bg-chart-yellow p-3 shadow-hard">
              <FileText aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">{title}</h2>
              <p className="mt-1 text-sm font-semibold">Open the source PDF in a new tab.</p>
            </div>
          </div>
          {item.file_url ? (
            <a
              className="pressable inline-flex min-h-11 items-center justify-center gap-2 border-2 border-ink bg-paper px-4 py-2 font-display text-sm font-bold uppercase shadow-hard"
              href={item.file_url}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open PDF
            </a>
          ) : (
            <span className="border-2 border-ink bg-vital-red px-3 py-2 font-bold">PDF URL missing</span>
          )}
        </div>
      </Card>
    );
  }

  if (item.type === 'youtube' || item.type === 'video') {
    return (
      <Card>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        {item.youtube_video_id ? (
          <div className="mt-4 aspect-video overflow-hidden rounded-[12px] border-[3px] border-ink bg-ink shadow-hard">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${item.youtube_video_id}`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="mt-3 border-2 border-ink bg-vital-red p-3 font-bold">YouTube video ID missing.</p>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-4 whitespace-pre-wrap text-base leading-7">{item.body}</p>
    </Card>
  );
}
