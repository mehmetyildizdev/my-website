import { defineType } from 'sanity';
import { CodeBlockIcon } from '@sanity/icons/CodeBlock';

/**
 * An "HTML Visual" is a freeform HTML snippet (e.g. a canvas animation)
 * stored as text. It can be used in the body as a block element, or as the
 * hero media for a post instead of a raster/vector image.
 *
 * On the frontend, render this inside a sandboxed <iframe srcdoc="...">
 * so the animation's JS runs in isolation from the page.
 */
export const htmlVisualType = defineType({
  name: 'htmlVisual',
  title: 'HTML Visual',
  type: 'object',
  icon: CodeBlockIcon,
  fields: [
    {
      name: 'htmlCode',
      title: 'HTML Code',
      type: 'text',
      rows: 12,
      description: 'Paste the full HTML snippet (including any <script> tags). It will be rendered in a sandboxed iframe.',
    },
    {
      name: 'alt',
      title: 'Alternative Text',
      type: 'string',
      description: 'Describe the visual for accessibility / SEO.',
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      description: 'CSS aspect-ratio value, e.g. "16 / 9" or "4 / 3".',
      initialValue: '16 / 9',
    },
  ],
  preview: {
    select: {
      title: 'alt',
      subtitle: 'caption',
      code: 'htmlCode',
    },
    prepare({ title, subtitle, code }) {
      return {
        title: title || 'HTML Visual',
        subtitle: subtitle || (code ? code.slice(0, 60) + '…' : 'No code yet'),
      };
    },
  },
});
