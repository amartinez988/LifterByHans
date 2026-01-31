import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

function getDocContent(slugParts: string[]): string | null {
  const docPath = path.join(process.cwd(), "docs", ...slugParts) + ".md";
  try {
    return fs.readFileSync(docPath, "utf-8");
  } catch {
    return null;
  }
}

function getDocTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : "Documentation";
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getDocContent(slug);

  if (!content) {
    return {
      title: "Not Found | Uplio Documentation",
    };
  }

  const title = getDocTitle(content);

  return {
    title: `${title} | Uplio Documentation`,
    description: `Learn about ${title} in Uplio - elevator service management platform.`,
  };
}

// Generate static paths for all docs at build time
export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), "docs");
  const paths: { slug: string[] }[] = [];

  function walkDir(dir: string, prefix: string[] = []) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath, [...prefix, item]);
      } else if (item.endsWith(".md") && item !== "README.md") {
        const slug = [...prefix, item.replace(".md", "")];
        paths.push({ slug });
      }
    }
  }

  try {
    walkDir(docsDir);
  } catch {
    // Directory doesn't exist, return empty
  }

  return paths;
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const content = getDocContent(slug);

  if (!content) {
    notFound();
  }

  // Calculate relative path depth for link transformation
  const depth = slug.length;

  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Transform internal doc links
          a: ({ href, children, ...props }) => {
            if (href?.endsWith(".md")) {
              // Handle relative links like ../people/mechanics.md
              let newHref = href;

              if (href.startsWith("../")) {
                // Go up one level and then to the path
                const parts = href.replace(/\.md$/, "").split("/");
                const upCount = parts.filter((p) => p === "..").length;
                const pathParts = parts.filter((p) => p !== "..");
                const currentBase = slug.slice(0, -upCount);
                newHref = "/docs/" + [...currentBase, ...pathParts].join("/");
              } else if (href.startsWith("./")) {
                // Same directory relative link
                newHref = "/docs/" + [...slug.slice(0, -1), href.slice(2, -3)].join("/");
              } else {
                // Just a filename in same directory
                newHref = "/docs/" + [...slug.slice(0, -1), href.replace(".md", "")].join("/");
              }

              return (
                <a href={newHref} {...props}>
                  {children}
                </a>
              );
            }
            return (
              <a href={href} {...props}>
                {children}
              </a>
            );
          },
          // Style tables nicely
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden" {...props}>
                {children}
              </table>
            </div>
          ),
          // Style code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Add icons to list items with checkboxes
          li: ({ children, ...props }) => {
            return <li {...props}>{children}</li>;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Navigation footer */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <a
            href="/docs"
            className="flex items-center gap-2 text-slate-500 hover:text-brand-600"
          >
            ← Back to Overview
          </a>
        </div>
      </div>
    </div>
  );
}
