interface Step {
  n: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    n: "1",
    title: "Probe",
    body: "Carries inline statutory or regulatory source material from Kenshiki's 30K-chunk governance corpus, plus a question.",
  },
  {
    n: "2",
    title: "Target model",
    body: "Reached through OpenRouter as the canonical adapter. Direct-provider shims exist for dispute-resolution replay.",
  },
  {
    n: "3",
    title: "Judge ensemble",
    body: "Two pinned external frontier judges from different provider families compile the response into a typed proof graph. No judge scores its own family.",
  },
  {
    n: "4",
    title: "Signed report",
    body: "Five-hash attestation chain: tool, probe registry, bridge catalog, schema, evaluator. RFC 8785 canonical form. Ed25519 signed.",
  },
];

export function HowItWorksSteps() {
  return (
    <div className="grid md:grid-cols-4 gap-4 not-prose">
      {STEPS.map((step) => (
        <StepCard key={step.n} step={step} />
      ))}
    </div>
  );
}

function StepCard({ step }: { step: Step }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm opacity-50 font-mono">Step {step.n}</div>
      <div className="font-semibold">{step.title}</div>
      <p className="text-sm opacity-80">{step.body}</p>
    </div>
  );
}
