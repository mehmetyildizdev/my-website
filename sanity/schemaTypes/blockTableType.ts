import { defineType } from 'sanity';

export const tableType = defineType({
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    {
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'tableRow',
          title: 'Row',
          fields: [
            {
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
        },
      ],
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
  ],
});
