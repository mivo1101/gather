"use client";

import { useEffect, useMemo, useState } from "react";
import type { RsvpQuestion } from "@/lib/data/invitation-content";
import type { EventGuest } from "@/lib/data/guests";
import type {
  RsvpAnswerValue,
  RsvpResponse,
} from "@/lib/data/rsvp-responses";
import { guestDisplayLabel } from "@/lib/invitation-paths";

interface EventRsvpSummaryProps {
  guests: EventGuest[];
  responses: RsvpResponse[];
  questions: RsvpQuestion[];
  missingTable?: boolean;
}

type ResponseView = "questions" | "guests";

interface OptionResult {
  id: string;
  label: string;
  guestIds: string[];
}

interface SelectedOption extends OptionResult {
  question: RsvpQuestion;
}

function hasAnswer(value: RsvpAnswerValue | undefined) {
  return Array.isArray(value)
    ? value.length > 0
    : typeof value === "string" && value.trim().length > 0;
}

function optionIsSelected(
  value: RsvpAnswerValue | undefined,
  optionId: string,
  optionLabel: string,
) {
  if (Array.isArray(value)) {
    return value.includes(optionId) || value.includes(optionLabel);
  }
  return value === optionId || value === optionLabel;
}

function questionTypeLabel(type: RsvpQuestion["type"]) {
  switch (type) {
    case "attend":
      return "Yes / No";
    case "single_choice":
      return "Single choice";
    case "multi_choice":
      return "Multiple choice";
    case "short_text":
      return "Text answer";
  }
}

function questionOptions(question: RsvpQuestion) {
  if (question.type === "attend") {
    return [
      { id: "yes", label: question.yesLabel || "Yes" },
      { id: "no", label: question.noLabel || "No" },
    ];
  }
  return question.options ?? [];
}

function optionLabelsForAnswer(
  question: RsvpQuestion,
  answer: RsvpAnswerValue | undefined,
) {
  if (!hasAnswer(answer)) return "Not answered";
  if (question.type === "attend") {
    return answer === "yes"
      ? question.yesLabel || "Yes"
      : question.noLabel || "No";
  }
  if (question.type === "short_text") {
    return Array.isArray(answer) ? answer.join(", ") : answer;
  }
  const values = Array.isArray(answer) ? answer : [answer];
  return values
    .map(
      (value) =>
        question.options?.find(
          (option) => option.id === value || option.label === value,
        )?.label ?? value,
    )
    .join(", ");
}

function formatSubmittedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Response submitted";
  return `Submitted ${new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)}`;
}

function OptionGuestDialog({
  selected,
  guestsById,
  responsesByGuest,
  onClose,
}: {
  selected: SelectedOption;
  guestsById: Map<string, EventGuest>;
  responsesByGuest: Map<string, RsvpResponse>;
  onClose: () => void;
}) {
  const [expandedGuestId, setExpandedGuestId] = useState<string | null>(null);
  const isMultipleChoice = selected.question.type === "multi_choice";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#fff0f7]/20 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="rsvp-option-dialog-title"
        aria-modal="true"
        role="dialog"
        className="max-h-[min(620px,calc(100vh-2rem))] w-full max-w-[430px] overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_18px_55px_rgba(0,0,0,0.2)]"
      >
        <header className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <h3
              id="rsvp-option-dialog-title"
              className="break-words text-base font-semibold text-black"
            >
              {selected.label}
            </h3>
            <p className="mt-1 text-sm text-grey">
              {selected.guestIds.length}{" "}
              {selected.guestIds.length === 1 ? "guest" : "guests"} selected
              this option
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="shrink-0 rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Close
          </button>
        </header>

        <ul className="max-h-[460px] overflow-y-auto border-t border-black/[0.07]">
          {selected.guestIds.map((guestId) => {
            const guest = guestsById.get(guestId);
            if (!guest) return null;
            const expanded = expandedGuestId === guestId;
            const answer = responsesByGuest.get(guestId)?.answers[
              selected.question.id
            ];
            return (
              <li key={guestId} className="border-b border-black/[0.07] last:border-0">
                {isMultipleChoice ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() =>
                        setExpandedGuestId(expanded ? null : guestId)
                      }
                      className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-[#fff5f9]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-black">
                          {guestDisplayLabel(guest)}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-grey">
                          {guest.email}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-medium text-[#a62964]">
                        {expanded ? "Hide selections" : "View all selections"}
                      </span>
                    </button>
                    {expanded ? (
                      <p className="bg-[#fff5f9] px-5 pb-4 pt-3 text-sm text-black/70">
                        <span className="font-medium text-black">Selected:</span>{" "}
                        {optionLabelsForAnswer(selected.question, answer)}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div className="px-5 py-3.5">
                    <p className="text-sm font-medium text-black">
                      {guestDisplayLabel(guest)}
                    </p>
                    <p className="mt-0.5 text-sm text-grey">{guest.email}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function QuestionSummary({
  question,
  responses,
  onSelectOption,
  guestsById,
  selectedOption,
  questionNumber,
}: {
  question: RsvpQuestion;
  responses: RsvpResponse[];
  onSelectOption: (selection: SelectedOption) => void;
  guestsById: Map<string, EventGuest>;
  selectedOption: SelectedOption | null;
  questionNumber: number;
}) {
  const answers = responses.map((response) => ({
    response,
    value: response.answers[question.id],
  }));

  if (question.type === "short_text") {
    const textAnswers = answers.filter(({ value }) => hasAnswer(value));
    return (
      <article className="min-w-0 overflow-hidden rounded-[18px] border border-black/[0.07] bg-white">
        <div className="flex items-start justify-between gap-4 bg-soft-grey/70 px-5 py-4">
          <div>
            <p className="text-sm text-grey">
              Question {questionNumber} · {textAnswers.length}{" "}
              {textAnswers.length === 1 ? "response" : "responses"}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-black">
              {question.label}
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-[#fff0f7] px-2.5 py-1 text-sm font-medium text-[#a62964]">
            {questionTypeLabel(question.type)}
          </span>
        </div>
        {textAnswers.length ? (
          <ul className="px-5 py-2">
            {textAnswers.map(({ response, value }) => {
              const guest = guestsById.get(response.guestId);
              return (
                <li
                  key={response.id}
                  className="border-b border-black/[0.06] py-3.5 last:border-0"
                >
                  <p className="text-sm text-black">
                    “{Array.isArray(value) ? value.join(", ") : value}”
                  </p>
                  <p className="mt-1 text-sm text-grey">
                    {guest ? guestDisplayLabel(guest) : "Guest"}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-5 py-5 text-sm text-grey">No answers yet.</p>
        )}
      </article>
    );
  }

  const results: OptionResult[] = questionOptions(question).map((option) => ({
    ...option,
    guestIds: answers
      .filter(({ value }) => optionIsSelected(value, option.id, option.label))
      .map(({ response }) => response.guestId),
  }));
  const unansweredGuestIds = answers
    .filter(({ value }) => !hasAnswer(value))
    .map(({ response }) => response.guestId);
  if (unansweredGuestIds.length) {
    results.push({
      id: "__not_answered__",
      label: "Not answered",
      guestIds: unansweredGuestIds,
    });
  }
  const responseCount = responses.length;

  return (
    <article className="min-w-0 overflow-hidden rounded-[18px] border border-black/[0.07] bg-white">
      <div className="flex items-start justify-between gap-4 bg-soft-grey/70 px-5 py-4">
        <div>
          <p className="text-sm text-grey">
            Question {questionNumber} · {responseCount}{" "}
            {responseCount === 1 ? "response" : "responses"}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-black">
            {question.label}
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff0f7] px-2.5 py-1 text-sm font-medium text-[#a62964]">
          {questionTypeLabel(question.type)}
        </span>
      </div>
      <div className="space-y-1 px-5 py-4">
        {results.map((result) => {
          const selected =
            selectedOption?.question.id === question.id &&
            selectedOption.id === result.id;
          const percentage = responseCount
            ? Math.round((result.guestIds.length / responseCount) * 100)
            : 0;
          return (
            <button
              key={result.id}
              type="button"
              aria-pressed={selected}
              disabled={result.guestIds.length === 0}
              onClick={() => onSelectOption({ ...result, question })}
              className={`group block w-full rounded-xl border px-3 py-3 text-left transition disabled:cursor-default disabled:hover:border-transparent disabled:hover:bg-transparent ${
                selected
                  ? "border-[#ffc5df] bg-[#fff0f7]"
                  : "border-transparent hover:bg-[#fff5f9]"
              }`}
            >
              <span className="flex items-start justify-between gap-4">
                <span className="text-sm leading-snug text-black">
                  {result.label}
                </span>
                <span className="shrink-0 text-sm text-grey">
                  {result.guestIds.length} · {percentage}%
                </span>
              </span>
              <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#f2ecef]">
                <span
                  className="block h-full rounded-full bg-signature"
                  style={{
                    width: `${percentage}%`,
                    opacity: result.id === "__not_answered__" ? 0.35 : 1,
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>
      <p className="border-t border-black/[0.06] px-5 py-3 text-sm text-grey">
        {question.type === "multi_choice"
          ? "Guests may select more than one option. Select one to see who chose it."
          : "Select an option to see guest names."}
      </p>
    </article>
  );
}

export function EventRsvpSummary({
  guests,
  responses,
  questions,
  missingTable = false,
}: EventRsvpSummaryProps) {
  const [view, setView] = useState<ResponseView>("questions");
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(
    null,
  );
  const [expandedGuestId, setExpandedGuestId] = useState<string | null>(null);
  const guestsById = useMemo(
    () => new Map(guests.map((guest) => [guest.id, guest])),
    [guests],
  );
  const responsesByGuest = useMemo(
    () => new Map(responses.map((response) => [response.guestId, response])),
    [responses],
  );
  const awaiting = Math.max(guests.length - responses.length, 0);

  return (
    <section className="rounded-[28px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] sm:p-[26px]">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-black">Guest Responses</h2>
          <p className="mt-1 text-sm text-grey">
            Review every submitted answer by question or by guest.
          </p>
        </div>
        <div
          className="inline-flex rounded-full bg-[#f1eff0] p-1.5"
          aria-label="Response view"
        >
          {(["questions", "guests"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={`rounded-full px-5 py-2.5 text-center text-sm font-medium transition ${
                view === value
                  ? "bg-black text-white shadow-[0_3px_9px_rgba(0,0,0,0.24)]"
                  : "text-grey hover:text-black"
              }`}
            >
              {value === "questions" ? "By question" : "By guest"}
            </button>
          ))}
        </div>
      </div>

      {missingTable ? (
        <p className="mt-5 rounded-2xl bg-soft-grey px-4 py-3 text-sm text-black/75">
          Run{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">
            supabase/migrations/008_event_rsvp_responses.sql
          </code>{" "}
          in Supabase, then refresh.
        </p>
      ) : guests.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-black/10 bg-soft-grey/50 px-4 py-8 text-center text-sm text-grey">
          Add guests and send invites to collect responses.
        </p>
      ) : (
        <>
          <div className="mt-[22px] grid grid-cols-1 divide-y divide-black/[0.08] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-baseline gap-2 py-2.5 sm:pr-5">
              <p className="text-lg font-semibold text-black">{guests.length}</p>
              <p className="text-sm text-grey">Total guests</p>
            </div>
            <div className="flex items-baseline gap-2 py-2.5 sm:px-5">
              <p className="text-lg font-semibold text-signature">
                {responses.length}
              </p>
              <p className="text-sm text-grey">Responses submitted</p>
            </div>
            <div className="flex items-baseline gap-2 py-2.5 sm:pl-5">
              <p className="text-lg font-semibold text-[#a56a14]">{awaiting}</p>
              <p className="text-sm text-grey">Awaiting response</p>
            </div>
          </div>

          {view === "questions" ? (
            <div className="mt-5">
              <h3 className="text-lg font-semibold text-black">
                Responses by question
              </h3>
              <p className="mt-1 text-sm text-grey">
                Results follow the questions included in this invitation.
              </p>
              {questions.length ? (
                <div className="mt-3 space-y-4">
                  {questions.map((question, index) => (
                    <QuestionSummary
                      key={question.id}
                      question={question}
                      responses={responses}
                      guestsById={guestsById}
                      onSelectOption={setSelectedOption}
                      selectedOption={selectedOption}
                      questionNumber={index + 1}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-soft-grey/60 px-4 py-6 text-sm text-grey">
                  Add interactive questions to the invitation to see response
                  summaries here.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-5">
              <h3 className="text-lg font-semibold text-black">
                Responses by guest
              </h3>
              <p className="mt-1 text-sm text-grey">
                Open a guest to review their complete submission.
              </p>
              <ul className="mt-4 divide-y divide-black/[0.07] overflow-hidden rounded-2xl border border-black/[0.07]">
                {guests.map((guest) => {
                  const response = responsesByGuest.get(guest.id);
                  const expanded = expandedGuestId === guest.id;
                  return (
                    <li key={guest.id}>
                      <div className="flex flex-wrap items-center gap-3 px-4 py-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-black">
                            {guestDisplayLabel(guest)}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-grey">
                            {response
                              ? formatSubmittedAt(response.submittedAt)
                              : guest.email}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-sm font-medium ${
                            response
                              ? "bg-[#fff0f7] text-[#a62964]"
                              : "bg-soft-grey text-grey"
                          }`}
                        >
                          {response ? "Responded" : "Awaiting"}
                        </span>
                        {response ? (
                          <button
                            type="button"
                            aria-expanded={expanded}
                            onClick={() =>
                              setExpandedGuestId(expanded ? null : guest.id)
                            }
                            className="rounded-full bg-black px-3 py-2 text-sm font-medium text-white"
                          >
                            {expanded ? "Hide answers" : "View answers"}
                          </button>
                        ) : null}
                      </div>
                      {response && expanded ? (
                        <dl className="space-y-3 border-t border-[#ffc5df] bg-[#fff5f9] px-4 py-4">
                          {questions.map((question) => (
                            <div key={question.id}>
                              <dt className="text-sm font-medium text-black">
                                {question.label}
                              </dt>
                              <dd className="mt-1 text-sm text-black/70">
                                {optionLabelsForAnswer(
                                  question,
                                  response.answers[question.id],
                                )}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}

      {selectedOption ? (
        <OptionGuestDialog
          selected={selectedOption}
          guestsById={guestsById}
          responsesByGuest={responsesByGuest}
          onClose={() => setSelectedOption(null)}
        />
      ) : null}
    </section>
  );
}
