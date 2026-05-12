import { DIMENSIONS, type Dimension } from "../../data/dimensions";

export function DimensionGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-6 not-prose">
      {DIMENSIONS.map((dim) => (
        <DimensionCard key={dim.label} dim={dim} />
      ))}
    </div>
  );
}

function DimensionCard({ dim }: { dim: Dimension }) {
  return (
    <article className="card bg-base-200 border border-base-300">
      <div className="card-body gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-mono font-bold text-primary">{dim.label}</span>
          <h3 className="text-xl font-semibold">{dim.name}</h3>
        </div>
        <p className="text-sm opacity-70 italic">{dim.question}</p>
        <p className="opacity-90">{dim.definition}</p>
        <div className="pt-3 mt-2 border-t border-base-300">
          <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Formal method</div>
          <code className="text-xs font-mono opacity-80 block whitespace-pre-wrap break-words">
            {dim.formalMethod}
          </code>
          <div className="text-xs opacity-60 mt-2">{dim.primaryMeasurement}</div>
        </div>
      </div>
    </article>
  );
}
