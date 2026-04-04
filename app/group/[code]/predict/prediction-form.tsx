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
  currentOmerDay,
}: {
  members: Member[];
  inviteCode: string;
  savedPredictions?: Record<string, number>;
  currentOmerDay?: number | null;
}) {
  const hasSaved = savedPredictions && Object.keys(savedPredictions).length > 0;
  const minDay = currentOmerDay ? currentOmerDay + 1 : 1;

  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const m of members) {
      if (m.isSelf) {
        init[m.id] = 49;
      } else if (savedPredictions?.[m.id] !== undefined) {
        init[m.id] = savedPredictions[m.id];
      } else {
        // New prediction defaults to midpoint of available range
        init[m.id] = Math.round((minDay + 49) / 2);
      }
    }
    return init;
  });

  return (
    <form action={submitPredictions}>
      <input type="hidden" name="inviteCode" value={inviteCode} />
      <div className="space-y-2">
        {members.map((m) => {
          // During omer: all existing predictions are locked, only new members are editable
          const existingDay = savedPredictions?.[m.id];
          const frozenExisting = !m.isSelf && currentOmerDay && existingDay !== undefined;

          return (
            <div key={m.id}>
              <input type="hidden" name={`pred_${m.id}`} value={values[m.id]} />
              <PredictionSlider
                name={m.name}
                avatarUrl={m.avatarUrl}
                initial={m.name[0]}
                value={values[m.id]}
                onChange={(v) => setValues((prev) => ({ ...prev, [m.id]: v }))}
                isSelf={m.isSelf}
                locked={m.isSelf || !!frozenExisting}
                minDay={!m.isSelf && currentOmerDay ? minDay : 1}
                frozenLabel={frozenExisting ? "locked" : undefined}
              />
            </div>
          );
        })}
      </div>
      <Button type="submit" className="mt-5">
        {hasSaved ? "✏️ Update Predictions" : "Submit Predictions"}
      </Button>
    </form>
  );
}
