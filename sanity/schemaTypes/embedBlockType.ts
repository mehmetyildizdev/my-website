import { defineType } from 'sanity';
import { InlineIcon } from '@sanity/icons/Inline';

/**
 * Universal embed block for use inside post body content.
 *
 * Supports two modes:
 *   - "url"      → renders an <iframe src="..."> — works for YouTube, Vimeo, Spotify, etc.
 *   - "htmlCode" → renders a sandboxed <iframe srcDoc="..."> — for canvas animations, SVGs, etc.
 *
 * The aspect-ratio field controls the height of the embed relative to its width.
 */
export const embedBlockType = defineType({
  name: 'embedBlock',
  title: 'Embed / iFrame',
  type: 'object',
  icon: InlineIcon,
  fields: [
    {
      name: 'embedType',
      title: 'Embed Type',
      type: 'string',
      options: {
        list: [
          { title: 'URL  (YouTube, Vimeo, Spotify, etc.)', value: 'url' },
          { title: 'HTML Code  (canvas animations, custom visuals)', value: 'htmlCode' },
        ],
        layout: 'radio',
      },
      initialValue: 'url',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'embedUrl',
      title: 'Embed URL',
      type: 'url',
      description: 'Paste the embed URL. For YouTube: use the /embed/ form, e.g. https://www.youtube.com/embed/VIDEO_ID',
      hidden: ({ parent }: { parent: any }) => parent?.embedType !== 'url',
    },
    {
      name: 'htmlCode',
      title: 'HTML Code',
      type: 'text',
      rows: 10,
      description: 'Paste a raw HTML snippet (canvas, WebGL animations, etc.). Runs in a sandboxed iframe — no access to the parent page.',
      hidden: ({ parent }: { parent: any }) => parent?.embedType !== 'htmlCode',
    },
    {
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      description: 'CSS aspect-ratio value, e.g. "16 / 9", "4 / 3", "1 / 1", "21 / 9".',
      initialValue: '16 / 9',
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'alt',
      title: 'Alternative Text',
      type: 'string',
      description: 'Describe the embed content for screen readers / accessibility.',
    },
  ],
  preview: {
    select: {
      embedType: 'embedType',
      embedUrl: 'embedUrl',
      caption: 'caption',
      alt: 'alt',
    },
    prepare({ embedType, embedUrl, caption, alt }) {
      const label = caption || alt || (embedType === 'url' ? embedUrl : 'Custom HTML Code');
      return {
        title: label ?? 'Embed',
        subtitle: embedType === 'url' ? 'URL Embed' : 'HTML Visual',
      };
    },
  },
});
