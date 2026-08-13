"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SettingsSaveFeedback } from "./SettingsSaveFeedback";

export interface SettingsActionResult {
  ok: boolean;
  message: string;
}

export function SettingsForm({
  action,
  label = "Save changes",
  refreshOnSuccess = false,
  children,
}: {
  action: (formData: FormData) => Promise<SettingsActionResult>;
  label?: string;
  refreshOnSuccess?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SettingsActionResult | null>(null);
  const [feedbackKey, setFeedbackKey] = useState(0);

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        if (!formRef.current || pending) return;

        setResult(null);
        const formData = new FormData(formRef.current);
        startTransition(async () => {
          const nextResult = await action(formData);
          setResult(nextResult);
          setFeedbackKey((key) => key + 1);
          if (nextResult.ok && refreshOnSuccess) router.refresh();
        });
      }}
    >
      {children}
      <div className="mt-6 flex justify-end border-t border-black/[0.06] pt-5">
        <div className="flex flex-col items-end gap-1.5">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : label}
          </Button>
          {result && (
            <SettingsSaveFeedback
              key={feedbackKey}
              message={result.message}
              tone={result.ok ? "success" : "error"}
            />
          )}
        </div>
      </div>
    </form>
  );
}
