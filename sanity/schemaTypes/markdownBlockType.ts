import { defineField, defineType } from 'sanity';

/**
 * A thin object wrapper around the "markdown" type.
 * Objects are valid Portable Text array members (unlike raw string types),
 * so this lets editors insert a full Markdown editor block anywhere inside
 * the body — perfect for pasting tables, formulas, etc.
 */
export const markdownBlockType = defineType({
  name: 'markdownBlock',
  title: 'Markdown',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Markdown Content',
      type: 'markdown',
      description: 'Paste or write Markdown here — tables, formulas, lists, etc.',
    }),
  ],
  preview: {
    select: { content: 'content' },
    prepare({ content }) {
      const firstLine = (content as string | undefined)?.split('\n').find((l: string) => l.trim());
      return {
        title: 'Markdown',
        subtitle: firstLine ?? '(empty)',
      };
    },
  },
});
