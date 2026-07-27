import { Check } from "lucide-react";
import type { ReactNode } from "react";

export interface PrdDocumentSheetProps {
  title: string;
  meta: string;
  body: string;
  editable?: boolean;
  onChange?(body: string): void;
}

export function PrdDocumentSheet({
  title,
  meta,
  body,
  editable,
  onChange,
}: PrdDocumentSheetProps) {
  if (editable) {
    return (
      <div className="prd-document-editor">
        <textarea
          aria-label="PRD 正文"
          onChange={(event) => onChange?.(event.target.value)}
          value={body}
        />
      </div>
    );
  }
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let key = 0;
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(<p key={`p-${key++}`}>{paragraph.join(" ")}</p>);
    paragraph = [];
  };
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push(
        <h2 key={`h-${key++}`} id={`sec-${key}`}>
          {line.replace("## ", "")}
        </h2>,
      );
    } else if (line.startsWith("✓ ")) {
      flushParagraph();
      blocks.push(
        <p className="check-line" key={`c-${key++}`}>
          <Check size={14} />
          {line.replace("✓ ", "")}
        </p>,
      );
    } else if (line === "") {
      flushParagraph();
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  return (
    <div className="pdf-sheet prd-sheet">
      <span className="document-tag">产品需求文档</span>
      <h1>{title}</h1>
      <p className="document-meta">{meta}</p>
      {blocks}
      <div className="pdf-page-number">1 / 1</div>
    </div>
  );
}
