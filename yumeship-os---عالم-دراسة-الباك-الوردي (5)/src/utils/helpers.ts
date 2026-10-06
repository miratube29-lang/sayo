// School year month helper (September = 0, August = 11)
export function getCurrentMonthIndex(): number {
  const calMonth = new Date().getMonth(); // 0: Jan, 8: Sep, 11: Dec
  if (calMonth >= 8) {
    return calMonth - 8; // Sep -> 0, Oct -> 1, Nov -> 2, Dec -> 3
  } else {
    return calMonth + 4; // Jan -> 4, Feb -> 5, ..., Aug -> 11
  }
}

// Convert a local file from PC to base64 Data URL
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
