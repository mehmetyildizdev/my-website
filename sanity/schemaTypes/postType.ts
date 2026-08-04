import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { TranslationBodyInput } from '../components/TranslationBodyInput';

const DEFAULT_AUTHOR_ID = 'af0d93b3-edbb-4776-8142-fb04bafe0fe3';

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'meta', title: 'Meta' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ── Content ────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      group: 'content',
    }),
    defineField({
      name: 'translationBody',
      title: 'Translation Body (EN)',
      type: 'blockContent',
      group: 'content',
      description:
        "Auto-translated English version of the Body. Click 'Translate with Gemini' above the editor to generate. Posts tagged 'Turkish' will show a translate button on the frontend.",
      components: {
        input: TranslationBodyInput,
      },
    }),

    // ── Meta ───────────────────────────────────────────────────────────
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
      group: 'meta',
      initialValue: {
        _ref: DEFAULT_AUTHOR_ID,
      },
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      group: 'meta',
      options: { hotspot: true },
      description: 'Used as the card thumbnail in post lists and for social sharing (OG/Twitter cards).',
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
    defineField({
      name: 'htmlVisual',
      title: 'HTML Visual (Hero Animation)',
      type: 'htmlVisual',
      group: 'meta',
      description:
        'Optional animated HTML snippet shown as the hero on the post page. If set, it replaces the Main Image in the hero area (but the Main Image is still used for card thumbnails and social sharing).',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'meta',
      of: [defineArrayMember({ type: 'reference', to: { type: 'category' } })],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'meta',
      of: [defineArrayMember({ type: 'reference', to: { type: 'tag' } })],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'meta',
    }),

    // ── SEO ────────────────────────────────────────────────────────────
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 7,
      group: 'seo',
      description: 'A short summary shown on the blog list page and in social previews. Keep it under 80 words.',
      validation: (Rule) =>
        Rule.custom((value: string | undefined) => {
          if (!value) return true;
          const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
          return wordCount <= 80 || `Excerpt must be 80 words or fewer (currently ${wordCount} words).`;
        }),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Used for the <meta name="description"> tag. Aim for 120–160 characters for best SEO.',
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection;
      return { ...selection, subtitle: author && `by ${author}` };
    },
  },
});
