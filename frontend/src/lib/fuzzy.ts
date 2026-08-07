export function fuzzyScore(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();

  if (!q) {
    return 1;
  }

  if (t === q) {
    return 1;
  }

  if (t.startsWith(q)) {
    return 0.9;
  }

  let ti = 0;
  let score = 0;
  let consecutive = 0;

  for (let qi = 0; qi < q.length; qi++) {
    let matched = -1;

    for (let j = ti; j < t.length; j++) {
      if (t[j] === q[qi]) {
        matched = j;
        break;
      }
    }

    if (matched === -1) {
      return -1;
    }

    if (matched === ti) {
      consecutive += 1;
    } else {
      const gap = matched - ti;
      const wordStart = matched === 0 || t[matched - 1] === ' ';
      score += wordStart ? 0.12 : gap > 3 ? -0.02 : 0.02;
      consecutive = 1;
    }

    score += 0.1 + Math.min(0.08, consecutive * 0.02);
    ti = matched + 1;
  }

  const coverage = q.length / t.length;
  return Math.max(0, score * coverage);
}

export function fuzzyRank<T>(query: string, items: T[], key: (item: T) => string): T[] {
  const scored = items
    .map((item) => ({ item, score: fuzzyScore(query, key(item)) }))
    .filter((entry) => entry.score >= 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.item);
}
