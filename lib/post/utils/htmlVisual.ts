/**
 * Wraps a raw HTML snippet with a minimal boilerplate document that:
 *   - Removes default margin/padding from html + body
 *   - Sets background to transparent so the iframe blends with its container
 *   - Hides overflow/scrollbars (the content is expected to be self-contained)
 *
 * Use this for every `srcDoc` attribute on an <iframe> that renders an htmlVisual
 * or embedBlock with htmlCode.
 */
export function wrapHtmlVisual(htmlCode: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{
  width:100%;height:100%;
  overflow:hidden;
  background:transparent;
}
</style>
</head>
<body>${htmlCode}</body>
</html>`;
}
