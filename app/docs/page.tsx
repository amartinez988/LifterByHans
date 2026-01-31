import fs from "fs";
import path from "path";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const metadata: Metadata = {
  title: "Documentation | Uplio",
  description: "Uplio user documentation and guides for elevator service management.",
};

async function getReadmeContent(): Promise<string> {
  const docsPath = path.join(process.cwd(), "docs", "README.md");
  try {
    return fs.readFileSync(docsPath, "utf-8");
  } catch {
    return "# Documentation\n\nWelcome to the Uplio documentation.";
  }
}

export default async function DocsPage() {
  const content = await getReadmeContent();

  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Transform internal doc links to use /docs routes
          a: ({ href, children, ...props }) => {
            if (href?.startsWith("./") && href.endsWith(".md")) {
              // Convert ./getting-started.md to /docs/getting-started
              const newHref = "/docs/" + href.slice(2, -3);
              return <a href={newHref} {...props}>{children}</a>;
            }
            if (href?.startsWith("../")) {
              // External link to parent directory - keep as is or convert
              return <a href={href} {...props}>{children}</a>;
            }
            return <a href={href} {...props}>{children}</a>;
          },
          // Style images
          img: ({ src, alt, ...props }) => {
            // Don't render images that reference local paths that won't work
            if (src?.startsWith("../public/")) {
              const newSrc = src.replace("../public/", "/");
              return (
                <img
                  src={newSrc}
                  alt={alt}
                  className="rounded-lg shadow-md max-w-xs"
                  {...props}
                />
              );
            }
            return <img src={src} alt={alt} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
