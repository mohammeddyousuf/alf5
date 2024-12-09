// Function to convert hex to HSL
const hexToHSL = (hex: string): string => {
  // Remove the hash if present
  hex = hex.replace(/^#/, '');

  // Parse the hex values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

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

  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
};

export const updateThemeColor = (colorKey: string, value: string) => {
  const root = document.documentElement;
  const hslValue = hexToHSL(value);
  
  switch (colorKey) {
    case 'primary':
      root.style.setProperty('--primary', hslValue);
      break;
    case 'secondary':
      root.style.setProperty('--secondary', hslValue);
      break;
    case 'accent':
      root.style.setProperty('--accent', hslValue);
      break;
    case 'background':
      root.style.setProperty('--background', hslValue);
      break;
    case 'foreground':
      root.style.setProperty('--foreground', hslValue);
      break;
  }
};

export const initializeThemeColors = (settings: any) => {
  if (!settings) return;
  
  console.log('Initializing theme colors with settings:', settings);

  if (settings.primary_color) {
    updateThemeColor('primary', settings.primary_color);
  }
  if (settings.secondary_color) {
    updateThemeColor('secondary', settings.secondary_color);
  }
  if (settings.accent_color) {
    updateThemeColor('accent', settings.accent_color);
  }
  if (settings.background_color) {
    updateThemeColor('background', settings.background_color);
  }
  if (settings.foreground_color) {
    updateThemeColor('foreground', settings.foreground_color);
  }
};