import { type SchemaTypeDefinition } from 'sanity';

import { blockContentType } from './blockContentType';
import { categoryType } from './categoryType';
import { postType } from './postType';
import { authorType } from './authorType';
import { tagType } from './tagType';
import { markdownBlockType } from './markdownBlockType';
import { htmlVisualType } from './htmlVisualType';
import { embedBlockType } from './embedBlockType';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    tagType,
    markdownBlockType,
    htmlVisualType, // still used as post-level hero field type
    embedBlockType, // universal body embed (URL or HTML)
  ],
};
