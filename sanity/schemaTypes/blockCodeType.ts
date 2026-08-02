import { defineType } from 'sanity';

export const codeType = defineType({
  name: 'code',
  title: 'Code',
  type: 'object',
  fields: [
    {
      name: 'code',
      title: 'Code',
      // uses the code input if the plugin is available; otherwise fallback to text
      type: 'code',
      options: {
        withFilename: true,
        language: 'javascript',
        languageAlternatives: [
          { title: 'JavaScript', value: 'javascript' },
          { title: 'TypeScript', value: 'typescript' },
          { title: 'HTML', value: 'html' },
          { title: 'CSS', value: 'css' },
          { title: 'Shell', value: 'sh' },
        ],
      },
    },
    {
      name: 'language',
      title: 'Language',
      type: 'string',
    },
    {
      name: 'filename',
      title: 'Filename',
      type: 'string',
    },
    {
      name: 'highlightedLines',
      title: 'Highlighted lines',
      type: 'array',
      of: [{ type: 'number' }],
    },
  ],
});
