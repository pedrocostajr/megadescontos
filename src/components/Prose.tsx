// Texto simples: parágrafos separados por linha em branco; "## " vira subtítulo.
export function Prose({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="prose">
      {blocks.map((b, i) => (b.startsWith("## ") ? <h2 key={i}>{b.slice(3)}</h2> : <p key={i}>{b}</p>))}
    </div>
  );
}
