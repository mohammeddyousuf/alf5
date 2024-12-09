export const updateThemeColor = (colorKey: string, value: string) => {
  const root = document.documentElement;
  
  // Convert hex to HSL
  const hex = value.replace('#', '');
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

  // Update the CSS variables based on color key
  switch (colorKey) {
    case 'primary':
      root.style.setProperty('--primary', `${hDeg} ${sPct}% ${lPct}%`);
      root.style.setProperty('--primary-foreground', '0 0% 98%');
      break;
    case 'secondary':
      root.style.setProperty('--secondary', `${hDeg} ${sPct}% ${lPct}%`);
      root.style.setProperty('--secondary-foreground', '222.2 47.4% 11.2%');
      break;
    case 'accent':
      root.style.setProperty('--accent', `${hDeg} ${sPct}% ${lPct}%`);
      root.style.setProperty('--accent-foreground', '222.2 47.4% 11.2%');
      break;
    case 'background':
      root.style.setProperty('--background', `${hDeg} ${sPct}% ${lPct}%`);
      // Update card, popover, and other background-related variables
      root.style.setProperty('--card', `${hDeg} ${sPct}% ${lPct}%`);
      root.style.setProperty('--popover', `${hDeg} ${sPct}% ${lPct}%`);
      break;
    case 'foreground':
      root.style.setProperty('--foreground', `${hDeg} ${sPct}% ${lPct}%`);
      // Update card-foreground, popover-foreground, and other text-related variables
      root.style.setProperty('--card-foreground', `${hDeg} ${sPct}% ${lPct}%`);
      root.style.setProperty('--popover-foreground', `${hDeg} ${sPct}% ${lPct}%`);
      break;
  }
};