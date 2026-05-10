export interface DisplayItineraryItem {
  time?: string;
  activity: string;
}

function parseJsonString(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function normalizeItinerary(value: unknown): DisplayItineraryItem[] {
  const parsed = typeof value === 'string' ? parseJsonString(value) : value;

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (typeof item === 'string') {
          const activity = item.trim();
          return activity ? { activity } : null;
        }

        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          const time = typeof record.time === 'string' ? record.time.trim() : '';
          const activity = typeof record.activity === 'string' ? record.activity.trim() : '';

          if (!activity) return null;
          return time ? { time, activity } : { activity };
        }

        return null;
      })
      .filter((item): item is DisplayItineraryItem => Boolean(item));
  }

  if (typeof parsed === 'string') {
    return parsed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((activity) => ({ activity }));
  }

  return [];
}

export function normalizeStringList(value: unknown): string[] {
  const parsed = typeof value === 'string' ? parseJsonString(value) : value;

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  if (typeof parsed === 'string') {
    return parsed
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}
