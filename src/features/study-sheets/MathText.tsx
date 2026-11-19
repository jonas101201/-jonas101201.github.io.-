import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../../styles/math-study.css';

/** Render only local, curated formula strings; KaTeX's HTML extensions stay off. */
export function MathFormula({ latex, display = false }: { latex: string; display?: boolean }) {
  const html = katex.renderToString(latex, {
    displayMode: display, throwOnError: true, trust: false, strict: 'error',
    output: 'htmlAndMathml', maxExpand: 100,
  });
  return <span className={display ? 'math-expression' : 'math-inline'} dangerouslySetInnerHTML={{ __html: html }}/>;
}

/** Dollar-delimited expressions keep the surrounding explanation translatable. */
export function MathText({ children }: { children: string }) {
  return <>{children.split(/(\$[^$]+\$)/g).map((part, index) =>
    part.startsWith('$') && part.endsWith('$')
      ? <MathFormula key={index} latex={part.slice(1, -1)}/>
      : part,
  )}</>;
}
