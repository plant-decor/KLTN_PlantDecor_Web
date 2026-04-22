'use client';

import React, { useMemo } from 'react';
import { Box } from '@mui/material';

interface RichTextDisplayProps {
    content: string | null | undefined;
    className?: string;
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
export default function RichTextDisplay({ content, className }: RichTextDisplayProps) {
    const sanitizedContent = useMemo(() => {
        if (!content || typeof content !== 'string') {
            return '';
        }

        const trimmed = content.trim();
        if (!trimmed) {
            return '';
        }

        // Check if content contains HTML tags
        const htmlTagRegex = /<[^>]+>/;
        if (htmlTagRegex.test(trimmed)) {
            return insertSoftBreaksIntoHtml(trimmed);
        }

        // Plain text - escape and wrap in paragraph
        const escaped = trimmed
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        return `<p>${insertSoftBreaksIntoText(escaped).replace(/\n/g, '<br/>')}</p>`;
    }, [content]);

    if (!sanitizedContent) {
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
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
    );
}