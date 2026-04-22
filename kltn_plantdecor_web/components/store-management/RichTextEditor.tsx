'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Box, FormHelperText, Typography } from '@mui/material';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
  onUploadImage?: (file: File) => Promise<string>;
  uploading?: boolean;
}

const normalizeVideoUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) {
    return trimmed;
  }

  try {
    const parsedUrl = new URL(trimmed);
    const host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const videoId = parsedUrl.pathname.replace('/', '').trim();
      return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
    }

    if (host.endsWith('youtube.com')) {
      if (parsedUrl.pathname === '/watch') {
        const videoId = parsedUrl.searchParams.get('v')?.trim();
        return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
      }

      if (parsedUrl.pathname.startsWith('/shorts/')) {
        const videoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0]?.trim();
        return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        return trimmed;
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
};

export default function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = 'Enter rich text...',
  error = false,
  helperText,
  required = false,
  disabled = false,
  minHeight = 250,
  maxHeight = 400,
  onUploadImage,
  uploading = false,
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    }),
    []
  );

  const formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'header',
    'list',
    'link',
    'image',
    'video',
  ];

  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) {
      return;
    }

    const toolbar = quill.getModule('toolbar');
    if (!toolbar) {
      return;
    }

    toolbar.addHandler('video', () => {
      const rawUrl = window.prompt('Enter YouTube URL');
      if (!rawUrl) {
        return;
      }

      const videoUrl = normalizeVideoUrl(rawUrl);
      const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
      quill.insertEmbed(range.index, 'video', videoUrl, 'user');
      quill.setSelection(range.index + 1);
    });

    if (onUploadImage) {
      toolbar.addHandler('image', () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.addEventListener('change', async () => {
          const file = input.files?.[0];
          if (!file) {
            return;
          }

          try {
            const imageUrl = await onUploadImage(file);
            const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
            quill.insertEmbed(range.index, 'image', imageUrl, 'user');
            quill.setSelection(range.index + 1);
          } catch (err) {
            console.error('Image upload failed:', err);
            alert('Failed to upload image. Please try again.');
          }
        });
      });
    }
  }, [onUploadImage]);

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" fontWeight="500" gutterBottom>
          {label}
          {required && <span style={{ color: 'var(--error, #EF4444)', marginLeft: '4px' }}>*</span>}
        </Typography>
      )}
      <Box
        sx={{
          border: error ? '1px solid var(--error, #EF4444)' : '1px solid var(--border, #e5e7eb)',
          borderRadius: '4px',
          backgroundColor: disabled ? 'var(--disabled-bg, #f3f4f6)' : 'white',
          overflow: 'hidden',
          '& .ql-toolbar': {
            borderBottom: '1px solid var(--border, #e5e7eb)',
            backgroundColor: 'var(--editor-toolbar-bg, #f9fafb)',
            '& .ql-formats': {
              marginRight: '8px',
            },
            '& button:hover': {
              color: 'var(--primary, #13EC5B)',
            },
            '& button.ql-active': {
              color: 'var(--primary, #13EC5B)',
            },
          },
          '& .ql-container': {
            borderTop: 'none',
            fontFamily: 'inherit',
            fontSize: '14px',
          },
          '& .ql-editor': {
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
            overflow: 'auto',
            padding: '12px',
            color: disabled ? 'var(--disabled-text, #9ca3af)' : 'var(--foreground, #171717)',
            '&.ql-blank::before': {
              color: 'var(--text-secondary, #6b7280)',
              fontStyle: 'italic',
              content: `"${placeholder}"`,
            },
            '& p': {
              margin: '0.5em 0',
            },
            '& h1, & h2': {
              marginTop: '0.5em',
              marginBottom: '0.3em',
            },
            '& ul, & ol': {
              marginLeft: '1.5em',
            },
            '& blockquote': {
              borderLeft: '4px solid var(--primary, #13EC5B)',
              paddingLeft: '12px',
              marginLeft: 0,
              color: 'var(--text-secondary, #6b7280)',
            },
            '& code': {
              backgroundColor: 'var(--code-bg, #f3f4f6)',
              padding: '2px 4px',
              borderRadius: '3px',
              color: 'var(--code-text, #1f2937)',
            },
            '& pre': {
              backgroundColor: 'var(--code-bg, #f3f4f6)',
              padding: '12px',
              borderRadius: '4px',
              overflow: 'auto',
            },
            '& a': {
              color: 'var(--primary, #13EC5B)',
              textDecoration: 'underline',
              '&:hover': {
                opacity: 0.8,
              },
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
          },
        }}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          readOnly={disabled || uploading}
          placeholder={placeholder}
        />
      </Box>
      {helperText && (
        <FormHelperText error={error} sx={{ mt: 0.5 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
}