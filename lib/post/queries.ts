export const POST_PROJECTION = `{
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  metaDescription,
  mainImage {
    asset->{
      url,
      metadata {
        dimensions
      }
    },
    alt,
    caption
  },
  htmlVisual {
    htmlCode,
    alt,
    caption,
    aspectRatio
  },
  translationBody[] {
    ...,
    _type == "image" => {
      asset-> {
        url,
        metadata { dimensions }
      },
      alt,
      caption
    }
  },
  author-> {
    _id,
    name,
    image {
      asset->{ url },
      alt
    },
    bio,
    social[] {
      name,
      url
    }
  },
  categories[]->{
    _id,
    title
  },
  tags[]->{
    _id,
    title
  },
  body[] {
    ...,
    _type == "image" => {
      asset-> {
        url,
        metadata {
          dimensions
        }
      },
      alt,
      caption
    }
  }
}`;

export const ALL_POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) ${POST_PROJECTION}`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] ${POST_PROJECTION}`;
