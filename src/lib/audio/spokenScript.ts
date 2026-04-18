import crypto from 'node:crypto';

export const SCRIPT_VERSION = 'v1';

interface SpokenScriptInput {
  slug: string;
  title: string;
  description?: string;
  content: string;
}

function stripFrontmatter(source: string): string {
  return source.replace(/^---[\s\S]*?---\s*/m, '');
}

function stripImports(source: string): string {
  return source
    .replace(/^import\s.+?;?$/gm, '')
    .replace(/^export\s.+?;?$/gm, '');
}

function stripJsxAndMdx(source: string): string {
  return source
    .replace(/<Figure[\s\S]*?<\/Figure>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ');
}

function stripMarkdown(source: string): string {
  return source
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/^>+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/[*_~]+/g, ' ');
}

function normalizeWhitespace(source: string): string {
  return source.replace(/\s+/g, ' ').trim();
}

export function buildSpokenScript(input: SpokenScriptInput) {
  const cleaned = normalizeWhitespace(
    stripMarkdown(stripJsxAndMdx(stripImports(stripFrontmatter(input.content)))),
  );

  const text = normalizeWhitespace(
    [
      input.title,
      input.description || '',
      cleaned,
      'End of article.',
    ].join(' '),
  );

  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify({
      version: SCRIPT_VERSION,
      slug: input.slug,
      title: input.title,
      description: input.description || '',
      text,
    }))
    .digest('hex');

  return {
    text,
    hash,
    version: SCRIPT_VERSION,
  };
}
