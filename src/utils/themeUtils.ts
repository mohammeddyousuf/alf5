export const updateThemeColor = (colorKey: string, value: string) => {
  const root = document.documentElement;
  
  // Remove any spaces and convert to lowercase
  const cleanValue = value.trim().toLowerCase();
  
  // Set the CSS variable
  switch (colorKey) {
    case 'primary':
      root.style.setProperty('--primary', cleanValue);
      root.style.setProperty('--primary-foreground', '#ffffff');
      break;
    case 'secondary':
      root.style.setProperty('--secondary', cleanValue);
      root.style.setProperty('--secondary-foreground', '#ffffff');
      break;
    case 'accent':
      root.style.setProperty('--accent', cleanValue);
      root.style.setProperty('--accent-foreground', '#ffffff');
      break;
    case 'background':
      root.style.setProperty('--background', cleanValue);
      break;
    case 'foreground':
      root.style.setProperty('--foreground', cleanValue);
      break;
    default:
      console.warn(`Unknown color key: ${colorKey}`);
  }
};

// Initialize theme colors from settings
export const initializeThemeColors = (settings: any) => {
  if (settings) {
    updateThemeColor('primary', settings.primary_color || '#9b87f5');
    updateThemeColor('secondary', settings.secondary_color || '#7E69AB');
    updateThemeColor('accent', settings.accent_color || '#6E59A5');
    updateThemeColor('background', settings.background_color || '#FFFFFF');
    updateThemeColor('foreground', settings.foreground_color || '#000000');
  }
};