'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';

interface RichTextDisplayProps {
    content: string | null | undefined;
    className?: string;
}

const YOUTUBE_VIDEO_ID_RE = /([a-zA-Z0-9_-]{11})/;

function toYouTubeEmbedUrl(input: string): string | null {
    const normalized = input.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    if (!normalized) return null;

    const directMatch = normalized.match(
        /(?:youtube(?:-nocookie)?\.com\/embed\/|youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    const videoId = directMatch?.[1] ?? normalized.match(YOUTUBE_VIDEO_ID_RE)?.[1];
    if (!videoId) return null;

    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}

function transformYouTubeLinksToIframes(html: string): string {
    // IMPORTANT: keep this transformation deterministic for SSR hydration.
    // Only use regex/string operations here (no DOM), so server + client first render match.
    return html.replace(
        /<a\b[^>]*\bhref=(["'])(https?:\/\/[^"']+)\1[^>]*>[\s\S]*?<\/a>/gi,
        (full, _q, href) => {
            const embedUrl = toYouTubeEmbedUrl(String(href));
            if (!embedUrl) {
                return full;
            }
            return `<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="${embedUrl}"></iframe>`;
        }
    );
}


function insertSoftBreaksIntoText(text: string, maxLen = 30): string {
    return text
        .split(/(\s+)/) // giữ lại space
        .map((word) => {
            if (word.length > maxLen && !/\s/.test(word)) {
                return word.replace(
                    new RegExp(`(.{${maxLen}})`, 'g'),
                    '$1\u200B'
                );
            }
            return word;
        })
        .join('');
}
function insertSoftBreaksIntoHtml(html: string, maxLen = 30): string {
    if (typeof document === 'undefined') {
        // SSR-safe fallback: keep HTML as-is.
        return html;
    }

    const container = document.createElement('div');
    container.innerHTML = html;

    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
    );

    let node;
    while ((node = walker.nextNode())) {
        node.textContent = insertSoftBreaksIntoText(
            node.textContent || '',
            maxLen
        );
    }

    return container.innerHTML;
}

function toBaseHtml(content: string): string {
    const trimmed = content.trim();
    if (!trimmed) {
        return '';
    }

    const htmlTagRegex = /<[^>]+>/;
    if (htmlTagRegex.test(trimmed)) {
        return transformYouTubeLinksToIframes(trimmed);
    }

    const embedUrl = toYouTubeEmbedUrl(trimmed);
    if (embedUrl) {
        return `<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="${embedUrl}"></iframe>`;
    }

    const escaped = trimmed
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    return `<p>${insertSoftBreaksIntoText(escaped).replace(/\n/g, '<br/>')}</p>`;
}

export default function RichTextDisplay({ content, className }: RichTextDisplayProps) {
    const baseHtml = useMemo(() => {
        if (!content || typeof content !== 'string') {
            return '';
        }
        return toBaseHtml(content);
    }, [content]);

    const [renderedHtml, setRenderedHtml] = useState(baseHtml);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        // Enhance after mount: insert soft breaks on client only.
        // Schedule the update so we don't call setState synchronously in the effect body.
        const handle = requestAnimationFrame(() => {
            const enhanced = insertSoftBreaksIntoHtml(baseHtml);
            setRenderedHtml((prev) => (prev === enhanced ? prev : enhanced));
        });

        return () => cancelAnimationFrame(handle);
    }, [baseHtml]);

    if (!renderedHtml) {
        return <Box className="text-gray-500 italic">No description provided</Box>;
    }

    return (
        <Box
            className={`prose prose-sm max-w-none ${className || ''}`}
            sx={{
                width: '100%',
                maxWidth: '100%',
                display: 'block',
                overflowX: 'hidden',
                overflowY: 'visible',
                '& p, & span, & h1, & h2, & h3, & h4, & li': {
                    wordBreak: 'normal',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-line',
                    lineHeight: '1.6',
                },

                // Global box fix
                '& *': {
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                },

                '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: '1rem 0',
                },

                '& iframe, & .ql-video': {
                    width: '100%',
                    maxWidth: '100%',
                    aspectRatio: '16 / 9',
                    minHeight: '240px',
                    height: 'auto',
                    border: 0,
                    display: 'block',
                    margin: '1rem 0',
                },

                // Quill alignment
                '& .ql-align-center': { textAlign: 'center' },
                '& .ql-align-right': { textAlign: 'right' },
                '& .ql-align-justify': { textAlign: 'justify' },

                '& blockquote': {
                    borderLeft: '4px solid var(--primary, #13EC5B)',
                    paddingLeft: '1rem',
                    fontStyle: 'italic',
                    margin: '0.75rem 0',
                    color: 'var(--text-secondary, #6b7280)',
                },

                '& h1': { fontSize: '1.875rem' },
                '& h2': { fontSize: '1.5rem' },
                '& h3': { fontSize: '1.25rem' },

                '& ul, & ol': {
                    marginLeft: '1.5rem',
                    marginBottom: '0.75rem',
                    color: 'var(--foreground, #171717)',
                },

                '& li': {
                    marginBottom: '0.25rem',
                    lineHeight: '1.6',
                },

                // ✅ FIX code block (không dùng anywhere nữa)
                '& code': {
                    backgroundColor: 'var(--code-bg, #f3f4f6)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    color: 'var(--code-text, #1f2937)',
                    fontSize: '0.875em',
                    fontFamily: '"Courier New", monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                },

                '& pre': {
                    backgroundColor: 'var(--code-bg, #f3f4f6)',
                    padding: '1rem',
                    borderRadius: '4px',
                    overflow: 'auto',
                    marginBottom: '0.75rem',
                    fontSize: '0.875em',
                    lineHeight: '1.5',
                    color: 'var(--code-text, #1f2937)',
                    '& code': {
                        backgroundColor: 'transparent',
                        padding: 0,
                        color: 'inherit',
                    },
                },
                '& a': {
                    color: 'var(--primary, #13EC5B)',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    textDecoration: 'underline',
                    '&:hover': {
                        opacity: 0.8,
                    },
                },

                '& strong': { fontWeight: 600 },
                '& em': { fontStyle: 'italic' },
                '& u': { textDecoration: 'underline' },

                '& hr': {
                    borderTop: '1px solid var(--border, #e5e7eb)',
                    margin: '1rem 0',
                },
            }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
    );
}