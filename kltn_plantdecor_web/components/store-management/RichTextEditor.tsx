'use client';

import React, { type ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, FormHelperText, Popover, Stack, TextField, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

type QuillRange = { index: number; length: number };

interface QuillToolbarModule {
  addHandler: (name: string, handler: () => void) => void;
  container?: Element;
}

interface QuillEditor {
  getModule: (name: 'toolbar') => QuillToolbarModule | null;
  getSelection: (focus?: boolean) => QuillRange | null;
  getLength: () => number;
  insertEmbed: (index: number, type: 'image' | 'video', value: string, source?: string) => void;
  setSelection: (index: number, length?: number) => void;
  getText: () => string;
  root?: { innerHTML?: string };
  isEnabled?: () => boolean;
  enable?: (enabled: boolean) => void;
  focus?: () => void;
}

interface ReactQuillHandle {
  getEditor: () => QuillEditor;
}

interface ReactQuillProps {
  theme?: string;
  value: string;
  onChange: (value: string) => void;
  modules?: unknown;
  formats?: string[];
  readOnly?: boolean;
  placeholder?: string;
}

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as unknown as ComponentType<
  ReactQuillProps & { ref?: React.Ref<ReactQuillHandle> }
>;

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
  const trimmed = input
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  if (!trimmed) {
    return trimmed;
  }

  try {
    const rawVideoIdMatch = trimmed.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const matchedVideoId = rawVideoIdMatch?.[1]?.trim();
    if (matchedVideoId) {
      return `https://www.youtube-nocookie.com/embed/${matchedVideoId}?rel=0`;
    }

    const parsedUrl = new URL(trimmed);
    const host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();

    const toEmbedUrl = (videoId: string) => `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;

    if (host === 'youtu.be') {
      const videoId = parsedUrl.pathname.replace('/', '').trim();
      return videoId ? toEmbedUrl(videoId) : trimmed;
    }

    if (host.endsWith('youtube.com')) {
      if (parsedUrl.pathname === '/watch') {
        const videoId = parsedUrl.searchParams.get('v')?.trim();
        return videoId ? toEmbedUrl(videoId) : trimmed;
      }

      if (parsedUrl.pathname.startsWith('/shorts/')) {
        const videoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0]?.trim();
        return videoId ? toEmbedUrl(videoId) : trimmed;
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        const videoId = parsedUrl.pathname.split('/embed/')[1]?.split('/')[0]?.trim();
        return videoId ? toEmbedUrl(videoId) : trimmed;
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
  const quillRef = useRef<ReactQuillHandle | null>(null);
  const [videoAnchorEl, setVideoAnchorEl] = useState<HTMLElement | null>(null);
  const [videoInputValue, setVideoInputValue] = useState('');
  const selectionRef = useRef<{ index: number; length: number } | null>(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['image', 'video'],
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
      const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
      selectionRef.current = range;
      const anchor = toolbar?.container?.querySelector?.('.ql-video') as HTMLElement | null;
      setVideoInputValue('');
      setVideoAnchorEl(anchor);
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
            const wasEnabled = typeof quill.isEnabled === 'function' ? quill.isEnabled() : true;
            if (!wasEnabled && typeof quill.enable === 'function') {
              quill.enable(true);
            }
            if (typeof quill.focus === 'function') {
              quill.focus();
            }
            const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
            quill.insertEmbed(range.index, 'image', imageUrl, 'user');
            quill.setSelection(range.index + 1);
            onChange(quill.root?.innerHTML ?? quill.getText());
            if (!wasEnabled && typeof quill.enable === 'function') {
              quill.enable(false);
            }
          } catch (err) {
            console.error('Image upload failed:', err);
            alert('Failed to upload image. Please try again.');
          }
        });
      });
    }
  }, [onChange, onUploadImage]);

  const handleCloseVideoPopover = () => {
    setVideoAnchorEl(null);
    selectionRef.current = null;
  };

  const handleInsertVideo = () => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) {
      handleCloseVideoPopover();
      return;
    }

    const rawUrl = videoInputValue.trim();
    if (!rawUrl) {
      handleCloseVideoPopover();
      return;
    }

    const videoUrl = normalizeVideoUrl(rawUrl);
    const wasEnabled = typeof quill.isEnabled === 'function' ? quill.isEnabled() : true;
    if (!wasEnabled && typeof quill.enable === 'function') {
      quill.enable(true);
    }
    if (typeof quill.focus === 'function') {
      quill.focus();
    }

    const range = selectionRef.current || quill.getSelection(true) || { index: quill.getLength(), length: 0 };
    quill.insertEmbed(range.index, 'video', videoUrl, 'user');
    quill.setSelection(range.index + 1);
    onChange(quill.root?.innerHTML ?? quill.getText());

    if (!wasEnabled && typeof quill.enable === 'function') {
      quill.enable(false);
    }

    handleCloseVideoPopover();
  };

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
      <Popover
        open={Boolean(videoAnchorEl)}
        anchorEl={videoAnchorEl}
        onClose={handleCloseVideoPopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        disableRestoreFocus
        PaperProps={{ sx: { p: 1.5, width: 360 } }}
      >
        <Stack spacing={1.25}>
          <Typography variant="subtitle2" fontWeight={600}>
            YouTube URL
          </Typography>
          <TextField
            size="small"
            placeholder="Paste YouTube link (watch/shorts/youtu.be)"
            value={videoInputValue}
            onChange={(e) => setVideoInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleInsertVideo();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                handleCloseVideoPopover();
              }
            }}
            autoFocus
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" onClick={handleCloseVideoPopover}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={handleInsertVideo} disabled={!videoInputValue.trim()}>
              Insert
            </Button>
          </Stack>
        </Stack>
      </Popover>
      {helperText && (
        <FormHelperText error={error} sx={{ mt: 0.5 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
}