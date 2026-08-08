import { useCallback, useState } from 'react';
import { slugify } from './slugify';

export interface TitleSlugFields {
  title: string;
  slug: string;
}

/**
 * Auto-fills the slug from the title as the user types, until they make a
 * manual edit to the slug field. Pass the current form state in and receive
 * the next form state back.
 */
export function useTitleSlug() {
  const [slugTouched, setSlugTouched] = useState(false);

  const updateTitle = useCallback(
    <F extends TitleSlugFields>(form: F, value: string): F => ({
      ...form,
      title: value,
      slug: slugTouched ? form.slug : slugify(value),
    }),
    [slugTouched],
  );

  const updateSlug = useCallback(<F extends TitleSlugFields>(form: F, value: string): F => {
    setSlugTouched(true);
    return { ...form, slug: value };
  }, []);

  const resetSlugSync = useCallback(() => setSlugTouched(false), []);

  return { updateTitle, updateSlug, resetSlugSync };
}