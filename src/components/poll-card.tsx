"use client";

import { useState, useTransition } from "react";
import { votePoll } from "@/app/actions/polls";
import type { PollData } from "@/app/actions/polls";

interface PollCardProps {
  poll: PollData;
  isLoggedIn?: boolean;
}

export function PollCard({ poll, isLoggedIn = true }: PollCardProps) {
  const [userVote, setUserVote] = useState<string | null>(
    poll.userVoteOptionId
  );
  const [options, setOptions] = useState(poll.options);
  const [totalVotes, setTotalVotes] = useState(poll.totalVotes);
  const [isPending, startTransition] = useTransition();

  const hasVoted = userVote !== null;

  function handleVote(optionId: string) {
    if (!isLoggedIn || hasVoted || isPending) return;

    // Optimistic update
    setUserVote(optionId);
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId
          ? { ...opt, voteCount: opt.voteCount + 1 }
          : opt
      )
    );
    setTotalVotes((prev) => prev + 1);

    startTransition(async () => {
      try {
        await votePoll(poll.id, optionId);
      } catch {
        // Revert on error
        setUserVote(null);
        setOptions((prev) =>
          prev.map((opt) =>
            opt.id === optionId
              ? { ...opt, voteCount: opt.voteCount - 1 }
              : opt
          )
        );
        setTotalVotes((prev) => prev - 1);
      }
    });
  }

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-secondary/50 p-4">
      {/* Question */}
      <p className="mb-3 text-sm font-semibold text-foreground">
        {poll.question}
      </p>

      {/* Options */}
      <div className="space-y-2">
        {options.map((option) => {
          const percentage =
            totalVotes > 0
              ? Math.round((option.voteCount / totalVotes) * 100)
              : 0;
          const isSelected = userVote === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || isPending || !isLoggedIn}
              className={`relative w-full overflow-hidden rounded-xl border text-left transition-all ${
                hasVoted
                  ? isSelected
                    ? "border-violet-500/50 bg-card"
                    : "border-border bg-card"
                  : "border-border bg-card hover:border-violet-500/40 hover:bg-violet-500/5"
              } ${!hasVoted && !isPending && isLoggedIn ? "cursor-pointer" : "cursor-default"}`}
            >
              {/* Fill bar (shown after voting) */}
              {hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ease-out"
                  style={{
                    width: `${percentage}%`,
                    background:
                      "linear-gradient(to right, rgba(139,92,246,0.15), rgba(168,85,247,0.2))",
                  }}
                />
              )}

              <div className="relative flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {/* Checkmark for user's choice */}
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0 text-violet-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  <span
                    className={`text-sm ${
                      isSelected
                        ? "font-semibold text-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {option.text}
                  </span>
                </div>

                {/* Percentage + count (shown after voting) */}
                {hasVoted && (
                  <span className="ml-2 flex-shrink-0 text-xs font-medium text-muted-foreground">
                    {percentage}% ({option.voteCount})
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Total votes */}
      <p className="mt-2 text-xs text-muted-foreground">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
      </p>
    </div>
  );
}
