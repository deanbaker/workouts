const EXPORT_KEYS = ['workout-logs', 'custom-program', 'weight-unit'];

export function exportData(): string {
  const data: Record<string, unknown> = {};
  for (const key of EXPORT_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  }
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(json);
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid data format' };
    }
    // Validate that workout-logs is an array if present
    if (data['workout-logs'] && !Array.isArray(data['workout-logs'])) {
      return { success: false, error: 'Invalid workout logs format' };
    }
    // Write all keys
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Invalid JSON file' };
  }
}

export function downloadJson(data: string, filename: string) {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
