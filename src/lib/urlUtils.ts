export function extractUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  // Check for HTML img tag
  if (trimmed.includes('<img')) {
    const srcMatch = trimmed.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }
  
  // Check for HTML a tag
  if (trimmed.includes('<a')) {
    const hrefMatch = trimmed.match(/href=["'](.*?)["']/);
    if (hrefMatch && hrefMatch[1]) {
      return hrefMatch[1];
    }
  }
  
  // Check for Markdown image
  if (trimmed.startsWith('![')) {
     const mdMatch = trimmed.match(/\((.*?)\)/);
     if (mdMatch && mdMatch[1]) {
         return mdMatch[1];
     }
  }

  return trimmed;
}
