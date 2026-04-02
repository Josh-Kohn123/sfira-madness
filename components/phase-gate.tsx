"use client";

import { useState, useEffect, type ReactNode } from "react";
import { getLocalOmerPhase, type OmerPhase } from "@/lib/omer-date-client";

interface PhaseGateProps {
  /** Phase(s) this content should be visible during */
  show: OmerPhase | OmerPhase[];
  /** Server-computed phase, used for initial render before client takes over */
  serverPhase: OmerPhase;
  children: ReactNode;
}

/**
 * Shows children only when the local browser clock matches the given phase(s).
 * Fixes the SSR timezone mismatch where the Vercel server (UTC) may compute
 * a different phase than the user's local time.
 */
export function PhaseGate({ show, serverPhase, children }: PhaseGateProps) {
  const [phase, setPhase] = useState<OmerPhase>(serverPhase);

  useEffect(() => {
    setPhase(getLocalOmerPhase());
  }, []);

  const allowed = Array.isArray(show) ? show : [show];
  if (!allowed.includes(phase)) return null;
  return <>{children}</>;
}
