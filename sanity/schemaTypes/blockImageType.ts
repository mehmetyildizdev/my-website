import { defineType } from 'sanity';
import { ImageIcon } from '@sanity/icons';

export const imageType = defineType({
  name: 'image',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    {
      name: 'alt',
      type: 'string',
      title: 'Alternative Text',
    },
    {
      name: 'caption',
      type: 'string',
      title: 'Caption',
      description: 'Caption for the image',
    },
  ],
});
