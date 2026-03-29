"use client";

import { useState } from "react";
import { PredictionSlider } from "@/components/prediction-slider";
import { Button } from "@/components/ui/button";
import { submitPredictions } from "@/lib/actions/predictions";

interface Member {
  id: string;
  name: string;
  avatarUrl: string | null;
  isSelf: boolean;
}

export function PredictionForm({
  members,
  inviteCode,
  savedPredictions,
}: {
  members: Member[];
  inviteCode: string;
  savedPredictions?: Record<string, number>;
}) {
  const hasSaved = savedPredictions && Object.keys(savedPredictions).length > 0;
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const m of members) {
      init[m.id] = m.isSelf ? 49 : (savedPredictions?.[m.id] ?? 25);
    }
    return init;
  });

  return (
    <form action={submitPredictions}>
      <input type="hidden" name="inviteCode" value={inviteCode} />
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id}>
            <input type="hidden" name={`pred_${m.id}`} value={values[m.id]} />
            <PredictionSlider
              name={m.name}
              avatarUrl={m.avatarUrl}
              initial={m.name[0]}
              value={values[m.id]}
              onChange={(v) => setValues((prev) => ({ ...prev, [m.id]: v }))}
              isSelf={m.isSelf}
              locked={m.isSelf}
            />
          </div>
        ))}
      </div>
      <Button type="submit" className="mt-5">
        {hasSaved ? "✏️ Update Predictions" : "🔒 Lock In Predictions"}
      </Button>
    </form>
  );
}
