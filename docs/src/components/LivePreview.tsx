import React, { useRef, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

interface LivePreviewProps {
  html: string;
  style?: React.CSSProperties;
}

function LivePreviewInner({ html, style }: LivePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
  }, [html]);

  return (
    <div
      className="component-preview"
      style={style}
      ref={ref}
    />
  );
}

export default function LivePreview(props: LivePreviewProps) {
  return (
    <BrowserOnly fallback={<div className="component-preview" />}>
      {() => <LivePreviewInner {...props} />}
    </BrowserOnly>
  );
}
