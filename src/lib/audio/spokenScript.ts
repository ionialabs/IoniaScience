import { createHash } from 'node:crypto';

export interface SpokenScriptPayload {
  slug: string;
  title: string;
  description?: string | null;
  content: string;
}

export interface SpokenScriptResult {
  text: string;
  hash: string;
}

const SOURCE_SECTION_REGEX = /(^|\n)##\s+Sources[\s\S]*$/i;
const FRONTMATTER_REGEX = /^---[\s\S]*?---\s*/;
const IMAGE_REGEX = /!\[[^\]]*\]\([^)]*\)/g;
const LINK_REGEX = /\[([^\]]+)\]\([^)]*\)/g;
const HTML_TAG_REGEX = /<[^>]+>/g;
const BLOCKQUOTE_PREFIX_REGEX = /^>\s?/gm;
const EMPHASIS_REGEX = /[*_`#]+/g;
const MULTISPACE_REGEX = /[ \t]+/g;
const MULTINEWLINE_REGEX = /\n{3,}/g;

export function buildSpokenScript(payload: SpokenScriptPayload): SpokenScriptResult {
  const sections = [payload.title.trim(), payload.description?.trim() || '', payload.content].filter(Boolean);
  const raw = sections.join('\n\n');
  const cleaned = normalizeForSpeech(raw);
  const hash = createHash('sha256').update(cleaned).digest('hex');
  return { text: cleaned, hash };
}

export function normalizeForSpeech(raw: string): string {
  return raw
    .replace(FRONTMATTER_REGEX, '')
    .replace(SOURCE_SECTION_REGEX, '')
    .replace(IMAGE_REGEX, ' ')
    .replace(LINK_REGEX, '$1')
    .replace(HTML_TAG_REGEX, ' ')
    .replace(BLOCKQUOTE_PREFIX_REGEX, '')
    .replace(EMPHASIS_REGEX, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(MULTISPACE_REGEX, ' ')
    .replace(MULTINEWLINE_REGEX, '\n\n')
    .trim();
}
