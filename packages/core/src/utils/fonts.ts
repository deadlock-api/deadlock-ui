/**
 * Runtime @font-face injection for Shadow DOM compatibility.
 *
 * Browsers only load fonts when a matching @font-face rule exists in the
 * document scope (light DOM). CSS declared inside a Shadow DOM tree can
 * reference a font-family, but the browser won't know where to fetch the
 * font files from unless the @font-face is also registered at the document
 * level.
 *
 * Because our components use `shadow: true`, we can't rely on the global
 * stylesheet alone — consumers would need to manually import it, which
 * breaks the plug-and-play contract of a web component library.
 *
 * Instead, `injectFonts()` programmatically appends a <style> element with
 * all @font-face declarations to document.head the first time a component
 * connects. This way, consumers only need the <script> tag — no extra CSS
 * import required.
 */
import { fontUrl } from './assets';

const STYLE_ID = 'dl-fonts';

const fonts: { file: string; weight: number; style: string; family: string; local: string[] }[] = [
  { file: 'retaildemo-regular', weight: 400, style: 'normal', family: 'Retail Demo', local: ['Retail Demo Regular', 'RetailDemo-Regular'] },
  { file: 'retaildemo-italic', weight: 400, style: 'italic', family: 'Retail Demo', local: ['Retail Demo Italic', 'RetailDemo-Italic'] },
  { file: 'retaildemo-semibold', weight: 600, style: 'normal', family: 'Retail Demo', local: ['Retail Demo Semibold', 'RetailDemo-Semibold'] },
  { file: 'retaildemo-semibolditalic', weight: 600, style: 'italic', family: 'Retail Demo', local: ['Retail Demo Semibold Italic', 'RetailDemo-SemiboldItalic'] },
  { file: 'retaildemo-bold', weight: 700, style: 'normal', family: 'Retail Demo', local: ['Retail Demo Bold', 'RetailDemo-Bold'] },
  { file: 'retaildemo-bolditalic', weight: 700, style: 'italic', family: 'Retail Demo', local: ['Retail Demo Bold Italic', 'RetailDemo-BoldItalic'] },
  { file: 'tetsubingothic', weight: 400, style: 'normal', family: 'Tetsubingothic', local: ['Tetsubin Gothic', 'Tetsubingothic'] },
];

export function injectFonts(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
    return;
  }

  const css = fonts
    .map(f => {
      const localSources = f.local.map(name => `local('${name}')`);
      const sources = [...localSources, `url('${fontUrl(f.file)}') format('opentype')`].join(', ');
      return `@font-face {
  font-family: '${f.family}';
  font-style: ${f.style};
  font-weight: ${f.weight};
  src: ${sources};
}`;
    })
    .join('\n');

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}
