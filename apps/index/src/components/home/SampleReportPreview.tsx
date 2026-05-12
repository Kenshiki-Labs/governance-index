import { Link } from "@tanstack/react-router";

export function SampleReportPreview() {
  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start not-prose">
      <div className="flex-1">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Every report is verifiable</h2>
        <p className="text-lg opacity-80 mb-6">
          A KGB report is not a marketing claim. It is a canonical JSON document with a five-hash
          attestation chain, Ed25519 signature, and a deterministic replay command. Any third party
          can re-run the exact published seeds against any model.
        </p>
        <Link to="/reports/sample" className="btn btn-primary">
          See a sample report →
        </Link>
      </div>
      <article className="flex-1 card bg-base-100 border border-base-300 font-mono text-xs">
        <div className="card-body gap-2">
          <div className="flex justify-between opacity-60">
            <span>report.json</span>
            <span>v0.1</span>
          </div>
          <div className="divider my-0" />
          <div>
            <span className="opacity-50">model:</span> <span>anthropic/claude-opus-4-7</span>
          </div>
          <div>
            <span className="opacity-50">classification:</span>{" "}
            <span className="text-success">BEHAVIORALLY_GOVERNED</span>
          </div>
          <div>
            <span className="opacity-50">EC:</span> 0.97 <span className="opacity-50">SAS:</span>{" "}
            0.93 <span className="opacity-50">IF:</span> 0.91{" "}
            <span className="opacity-50">AUC:</span> 0.88
          </div>
          <div>
            <span className="opacity-50">attestation:</span> <span>5 hashes verified</span>
          </div>
          <div>
            <span className="opacity-50">signature:</span> <span>Ed25519 ✓</span>
          </div>
        </div>
      </article>
    </div>
  );
}
