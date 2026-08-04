'use client';

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './sanity/env';
import { schema } from './sanity/schemaTypes';
import { structure } from './sanity/structure';
import { CustomLayout } from './sanity/studioLayout';
import { codeInput } from '@sanity/code-input';
import { markdownSchema } from 'sanity-plugin-markdown';

import React from 'react';

function StudioIcon() {
  return React.createElement('img', {
    src: '/logo_l.svg',
    alt: 'Mehmet Yıldız',
    style: { height: '20px', width: 'auto', objectFit: 'contain' },
  });
}

export default defineConfig({
  title: 'Mehmet Yıldız',
  icon: StudioIcon,
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    codeInput(),
    markdownSchema(),
  ],

  studio: {
    components: {
      layout: CustomLayout,
    },
  },
});
