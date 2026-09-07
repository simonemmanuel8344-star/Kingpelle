export function extractUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // 1. Direct Data URL or blob
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 2. Check for HTML img tag: <img ... src="..." ...>
  if (/<img\b[^>]*>/i.test(trimmed)) {
    const srcMatch = trimmed.match(/<img\b[^>]*?\bsrc=["']?([^"'\s>]+)["']?/i);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1].trim();
    }
  }

  // 3. Check for BBCode [img]...[/img]
  if (/\[img\](.*?)\[\/img\]/i.test(trimmed)) {
    const bbMatch = trimmed.match(/\[img\](.*?)\[\/img\]/i);
    if (bbMatch && bbMatch[1]) {
      return bbMatch[1].trim();
    }
  }

  // 4. Check for Markdown image: ![alt](url)
  if (/!\[.*?\]\((.*?)\)/.test(trimmed)) {
    const mdMatch = trimmed.match(/!\[.*?\]\((.*?)\)/);
    if (mdMatch && mdMatch[1]) {
      return mdMatch[1].trim();
    }
  }

  // 5. Check for HTML anchor tag with href: <a ... href="..." ...>
  if (/<a\b[^>]*>/i.test(trimmed)) {
    const hrefMatch = trimmed.match(/<a\b[^>]*?\bhref=["']?([^"'\s>]+)["']?/i);
    if (hrefMatch && hrefMatch[1]) {
      return hrefMatch[1].trim();
    }
  }

  // 6. If string contains HTML brackets and any http/https link
  if (trimmed.includes('<') && (trimmed.includes('http://') || trimmed.includes('https://'))) {
    const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
    if (urlMatch && urlMatch[0]) {
      return urlMatch[0].trim();
    }
  }

  return trimmed;
}
