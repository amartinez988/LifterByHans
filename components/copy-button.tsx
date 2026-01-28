"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}
