import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { slugify } from "@/lib/post/utils/headings";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostRendererProps {
  value: BodyBlock[];
}

function getTextFromValue(value: any): string {
  return Array.isArray(value.children)
    ? value.children.map((c: any) => c.text || "").join(" ")
    : "";
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 font-rubik leading-relaxed text-foreground/85 text-pretty">{children}</p>,
    h1: ({ children, value }) => (
      <h1 id={slugify(getTextFromValue(value))} className="mt-12 mb-6 text-4xl font-extrabold text-foreground tracking-tight text-pretty">{children}</h1>
    ),
    h2: ({ children, value }) => (
      <h2 id={slugify(getTextFromValue(value))} className="mt-6 mb-6 text-3xl font-bold text-foreground/95 tracking-normal text-pretty">{children}</h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={slugify(getTextFromValue(value))} className="mt-2 mb-4 text-2xl font-semibold text-foreground/90 tracking-normal text-pretty">{children}</h3>
    ),
    h4: ({ children, value }) => (
      <h4 id={slugify(getTextFromValue(value))} className="mt-1 mb-2 text-xl font-medium text-foreground tracking-tight text-pretty">{children}</h4>
    ),
    h5: ({ children, value }) => (
      <h5 id={slugify(getTextFromValue(value))} className="mb-1 text-lg font-medium text-foreground tracking-tight text-pretty">{children}</h5>
    ),
    h6: ({ children, value }) => (
      <h6 id={slugify(getTextFromValue(value))} className="mb-1 text-base font-medium text-foreground tracking-tight text-pretty">{children}</h6>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mb-6 border-l-4 border-gold bg-card/40 pl-6 py-2 italic text-highlight/85 backdrop-blur-sm rounded-r-lg shadow-sm text-pretty">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc ml-8 my-4 space-y-2 text-foreground/85">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal ml-8 my-4 space-y-2 text-foreground/85">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-2">{children}</li>,
    number: ({ children }) => <li className="mb-2">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-metadata/85">{children}</strong>,
    em: ({ children }) => <em className="text-metadata/85">{children}</em>,
    link: ({ value, children }) => (
      <a href={value.href} target="_blank" rel="noopener noreferrer" className="text-link font-semibold underline decoration-link/30 underline-offset-4 transition-colors hover:text-link-hover hover:decoration-link-hover/50">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const image = value as ImageBlock;

      if (!image?.asset?.url) {
        return null;
      }

      const width = image.asset.metadata?.dimensions?.width ?? 1280;
      const height = image.asset.metadata?.dimensions?.height ?? 720;

      return (
        <figure>
          <Image
            src={image.asset.url}
            alt={image.alt ?? ""}
            width={width}
            height={height}
          />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      );
    },
    code: ({ value }) => {
      const codeBlock = value as CodeBlock;

      if (!codeBlock?.code) {
        return null;
      }

      return (
        <figure>
          {codeBlock.filename && <figcaption>{codeBlock.filename}</figcaption>}
          <pre
            data-language={codeBlock.language}
            data-highlighted-lines={JSON.stringify(
              codeBlock.highlightedLines ?? []
            )}
          >
            <code>{codeBlock.code}</code>
          </pre>
        </figure>
      );
    },
    markdownBlock: ({ value }: { value: { content?: string } }) => {
      const content = (value as { content?: string }).content;
      if (!content) return null;
      return (
        <div className="markdown-block my-8 w-full">
          <div className="w-full overflow-x-auto rounded-lg border border-foreground/15">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <table className="w-full border-collapse text-sm">
                    {children}
                  </table>
                ),
                thead: ({ children }) => (
                  <thead className="bg-foreground/8 text-foreground/90">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-foreground/10">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="even:bg-foreground/4 hover:bg-foreground/8 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left whitespace-nowrap border-b border-foreground/15"
                  >
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 border-r border-foreground/10 last:border-r-0">
                    {children}
                  </td>
                ),
                p: ({ children }) => <p className="my-4">{children}</p>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      );
    },
  },
}

export function PostRenderer({ value }: PostRendererProps) {
  return <PortableText value={value} components={components} />;
}
