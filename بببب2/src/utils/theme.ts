// Dynamic theme & site color generator
// Accurately preserves the EXACT user-selected color without distortion
// (e.g. #000000 remains pure black, #FFF0F5 remains very light pink, sky blue remains sky blue)

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export function parseHex(hex: string): string {
  let c = (hex || '').replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(c)) {
    return 'F472B6'; // Default fallback
  }
  return c.toUpperCase();
}

export function hexToRgb(hex: string): RGBColor {
  const c = parseHex(hex);
  return {
    r: parseInt(c.substring(0, 2), 16),
    g: parseInt(c.substring(2, 4), 16),
    b: parseInt(c.substring(4, 6), 16),
  };
}

export function hexToHsl(hex: string): HSLColor {
  const { r: r255, g: g255, b: b255 } = hexToRgb(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function applySiteColor(rawHex: string): void {
  if (typeof document === 'undefined') return;

  const cleanHexStr = parseHex(rawHex);
  const exactHex = `#${cleanHexStr}`;
  const rgb = hexToRgb(cleanHexStr);
  const hsl = hexToHsl(cleanHexStr);

  const { r, g, b } = rgb;
  const { h, s, l } = hsl;

  // Check if monochromatic (grayscale, black, white, gray)
  const isAchromatic = Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8 && Math.abs(r - b) <= 8;

  let c50: string;
  let c100: string;
  let c200: string;
  let c300: string;
  let c400: string;
  let c500: string = exactHex;
  let c600: string;
  let c700: string;
  let c800: string;
  let c900: string;

  let r400: string;
  let r500: string;
  let r600: string;
  let r700: string;

  // Heading color for Light Mode
  let lightHeadingColor: string;
  // Heading color for Dark Mode
  let darkHeadingColor: string;

  if (isAchromatic) {
    // Pure Black / Neutral Gray / White
    if (l < 30) {
      // Very dark / Pure Black (#000000)
      c500 = exactHex;
      c600 = '#18181b';
      c700 = '#27272a';
      c800 = '#3f3f46';
      c900 = '#52525b';
      c400 = '#71717a';
      c300 = '#a1a1aa';
      c200 = '#d4d4d8';
      c100 = '#e4e4e7';
      c50 = '#f4f4f5';

      r400 = '#71717a';
      r500 = '#3f3f46';
      r600 = '#27272a';
      r700 = '#18181b';

      lightHeadingColor = '#09090b';
      darkHeadingColor = '#FFFFFF'; // Clean pure white in dark mode so it pops on black
    } else if (l > 80) {
      // Very light / Pure White (#FFFFFF)
      c500 = exactHex;
      c600 = '#e4e4e7';
      c700 = '#d4d4d8';
      c800 = '#a1a1aa';
      c900 = '#71717a';
      c400 = '#f4f4f5';
      c300 = '#fafafa';
      c200 = '#f4f4f5';
      c100 = '#f8fafc';
      c50 = '#ffffff';

      r400 = '#f4f4f5';
      r500 = '#e4e4e7';
      r600 = '#d4d4d8';
      r700 = '#a1a1aa';

      lightHeadingColor = '#18181b';
      darkHeadingColor = '#FFFFFF';
    } else {
      // Mid grays
      c50 = `hsl(0, 0%, 97%)`;
      c100 = `hsl(0, 0%, 93%)`;
      c200 = `hsl(0, 0%, 85%)`;
      c300 = `hsl(0, 0%, 75%)`;
      c400 = `hsl(0, 0%, ${Math.min(70, l + 10)}%)`;
      c500 = exactHex;
      c600 = `hsl(0, 0%, ${Math.max(20, l - 10)}%)`;
      c700 = `hsl(0, 0%, ${Math.max(15, l - 20)}%)`;
      c800 = `hsl(0, 0%, ${Math.max(10, l - 30)}%)`;
      c900 = `hsl(0, 0%, ${Math.max(5, l - 40)}%)`;

      r400 = c400;
      r500 = c500;
      r600 = c600;
      r700 = c700;

      lightHeadingColor = '#0f172a';
      darkHeadingColor = '#F8FAFC';
    }
  } else {
    // Chromatic color (Pink, Blue, Lavender, Mint, Sky Blue, Orange, Red, etc.)
    c500 = exactHex;

    if (l >= 78) {
      // High lightness colors like Very Light Pink (#FFF0F5, #FFE4E6)
      c50 = `hsl(${h}, ${s}%, 98%)`;
      c100 = `hsl(${h}, ${s}%, 96%)`;
      c200 = `hsl(${h}, ${s}%, 93%)`;
      c300 = `hsl(${h}, ${s}%, 88%)`;
      c400 = `hsl(${h}, ${s}%, 82%)`;
      c600 = `hsl(${h}, ${s}%, ${Math.max(30, l - 15)}%)`;
      c700 = `hsl(${h}, ${s}%, ${Math.max(22, l - 30)}%)`;
      c800 = `hsl(${h}, ${s}%, ${Math.max(16, l - 45)}%)`;
      c900 = `hsl(${h}, ${s}%, ${Math.max(10, l - 58)}%)`;

      lightHeadingColor = `hsl(${h}, ${Math.min(100, Math.max(s, 65))}%, 30%)`;
      darkHeadingColor = `hsl(${h}, ${Math.min(100, Math.max(s, 65))}%, 82%)`;
    } else if (l <= 30) {
      // Deep dark chromatic colors
      c50 = `hsl(${h}, ${Math.min(s, 65)}%, 97%)`;
      c100 = `hsl(${h}, ${Math.min(s, 70)}%, 94%)`;
      c200 = `hsl(${h}, ${Math.min(s, 75)}%, 88%)`;
      c300 = `hsl(${h}, ${Math.min(s, 80)}%, 78%)`;
      c400 = `hsl(${h}, ${s}%, ${Math.min(68, l + 25)}%)`;
      c600 = `hsl(${h}, ${s}%, ${Math.max(12, l - 8)}%)`;
      c700 = `hsl(${h}, ${s}%, ${Math.max(8, l - 14)}%)`;
      c800 = `hsl(${h}, ${s}%, ${Math.max(5, l - 18)}%)`;
      c900 = `hsl(${h}, ${s}%, 4%)`;

      lightHeadingColor = exactHex;
      darkHeadingColor = `hsl(${h}, ${Math.min(100, Math.max(s, 75))}%, 70%)`;
    } else {
      // Standard balanced lightness
      c50 = `hsl(${h}, ${Math.min(s, 65)}%, 97%)`;
      c100 = `hsl(${h}, ${Math.min(s, 70)}%, 94%)`;
      c200 = `hsl(${h}, ${Math.min(s, 75)}%, 88%)`;
      c300 = `hsl(${h}, ${Math.min(s, 80)}%, 78%)`;
      c400 = `hsl(${h}, ${s}%, ${Math.min(80, l + 12)}%)`;
      c600 = `hsl(${h}, ${s}%, ${Math.max(20, l - 10)}%)`;
      c700 = `hsl(${h}, ${s}%, ${Math.max(14, l - 20)}%)`;
      c800 = `hsl(${h}, ${s}%, ${Math.max(10, l - 30)}%)`;
      c900 = `hsl(${h}, ${s}%, ${Math.max(6, l - 40)}%)`;

      lightHeadingColor = `hsl(${h}, ${Math.min(100, Math.max(s, 65))}%, 36%)`;
      // In dark mode: luminous, rich tint of the EXACT same chosen hue
      darkHeadingColor = `hsl(${h}, ${Math.min(100, Math.max(s, 75))}%, ${Math.min(84, Math.max(65, l))}%)`;
    }

    const roseHue = (h + 15) % 360;
    r400 = `hsl(${roseHue}, ${s}%, ${Math.min(85, l + 7)}%)`;
    r500 = `hsl(${roseHue}, ${s}%, ${l}%)`;
    r600 = `hsl(${roseHue}, ${s}%, ${Math.max(18, l - 12)}%)`;
    r700 = `hsl(${roseHue}, ${s}%, ${Math.max(12, l - 22)}%)`;
  }

  // Calculate perceived luminance to guarantee legible text on buttons
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const contrastText = luminance > 0.65 ? '#0f172a' : '#ffffff';

  // Apply to documentElement styles
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--color-pink-50', c50);
  rootStyle.setProperty('--color-pink-100', c100);
  rootStyle.setProperty('--color-pink-200', c200);
  rootStyle.setProperty('--color-pink-300', c300);
  rootStyle.setProperty('--color-pink-400', c400);
  rootStyle.setProperty('--color-pink-500', c500);
  rootStyle.setProperty('--color-pink-600', c600);
  rootStyle.setProperty('--color-pink-700', c700);
  rootStyle.setProperty('--color-pink-800', c800);
  rootStyle.setProperty('--color-pink-900', c900);

  rootStyle.setProperty('--color-rose-400', r400);
  rootStyle.setProperty('--color-rose-500', r500);
  rootStyle.setProperty('--color-rose-600', r600);
  rootStyle.setProperty('--color-rose-700', r700);

  rootStyle.setProperty('--theme-primary', c500);
  rootStyle.setProperty('--theme-primary-hover', c600);
  rootStyle.setProperty('--theme-border', c200);
  rootStyle.setProperty('--theme-text', c800);
  rootStyle.setProperty('--theme-accent', r500);
  rootStyle.setProperty('--theme-contrast-text', contrastText);
  rootStyle.setProperty('--theme-heading-color', lightHeadingColor);

  // Inject or update style tag for Tailwind utility inheritance
  let styleEl = document.getElementById('dynamic-site-theme') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-site-theme';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    :root, [data-theme] {
      --color-pink-50: ${c50} !important;
      --color-pink-100: ${c100} !important;
      --color-pink-200: ${c200} !important;
      --color-pink-300: ${c300} !important;
      --color-pink-400: ${c400} !important;
      --color-pink-500: ${c500} !important;
      --color-pink-600: ${c600} !important;
      --color-pink-700: ${c700} !important;
      --color-pink-800: ${c800} !important;
      --color-pink-900: ${c900} !important;
      --color-rose-400: ${r400} !important;
      --color-rose-500: ${r500} !important;
      --color-rose-600: ${r600} !important;
      --color-rose-700: ${r700} !important;
      --theme-primary: ${c500} !important;
      --theme-primary-hover: ${c600} !important;
      --theme-border: ${c200} !important;
      --theme-text: ${c800} !important;
      --theme-accent: ${r500} !important;
      --theme-contrast-text: ${contrastText} !important;
      --theme-heading-color: ${lightHeadingColor} !important;
    }

    .dark, [data-dark="true"], [data-theme="pitch_black"] {
      --theme-primary: ${c500} !important;
      --theme-primary-hover: ${c400} !important;
      --theme-border: #27272a !important;
      --theme-heading-color: ${darkHeadingColor} !important;
      --color-pink-50: #18181b !important;
      --color-pink-100: #27272a !important;
      --color-pink-200: #3f3f46 !important;
      --color-pink-300: ${darkHeadingColor} !important;
      --color-pink-400: ${darkHeadingColor} !important;
      --color-pink-500: ${c500} !important;
      --color-pink-600: ${c500} !important;
      --color-pink-700: ${darkHeadingColor} !important;
      --color-pink-800: ${darkHeadingColor} !important;
      --color-pink-900: ${darkHeadingColor} !important;
    }

    .dark h1,
    .dark h2,
    .dark h3,
    .dark h4,
    .dark h5,
    .dark h6 {
      color: ${darkHeadingColor} !important;
    }
  `;
}

export const SITE_COLOR_PRESETS = [
  { label: 'Pitch Black', hex: '#000000' },
  { label: 'Very Light Pink', hex: '#FFF0F5' },
  { label: 'Pastel Pink', hex: '#F472B6' },
  { label: 'Vibrant Magenta', hex: '#EC4899' },
  { label: 'Sky Blue', hex: '#0284C7' },
  { label: 'Ocean Blue', hex: '#3B82F6' },
  { label: 'Lavender Purple', hex: '#8B5CF6' },
  { label: 'Deep Violet', hex: '#7C3AED' },
  { label: 'Emerald Mint', hex: '#10B981' },
  { label: 'Teal Cyan', hex: '#14B8A6' },
  { label: 'Sunset Coral', hex: '#F97316' },
  { label: 'Crimson Ruby', hex: '#E11D48' },
  { label: 'Warm Amber', hex: '#F59E0B' },
  { label: 'Pure White', hex: '#FFFFFF' },
];
