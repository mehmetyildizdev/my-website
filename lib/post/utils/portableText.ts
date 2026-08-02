export function isPortableTextBlock(block: BodyBlock): block is PortableTextBlock {
  return block._type === 'block';
}

export function extractPlainText(blocks?: BodyBlock[]): string {
  if (!blocks?.length) {
    return '';
  }

  return blocks
    .filter(isPortableTextBlock)
    .map((block) => {
      if (!Array.isArray(block.children)) {
        return '';
      }

      return block.children
        .map((child: unknown) =>
          typeof child === 'object' && child !== null && 'text' in child ? String((child as { text?: string }).text ?? '') : '',
        )
        .join(' ');
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
