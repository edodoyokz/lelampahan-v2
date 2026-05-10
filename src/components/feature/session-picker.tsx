"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format-currency";

export interface Session {
  id: string;
  startsAt: Date;
  capacity: number;
  remainingCapacity: number;
  ticketTypes: { id: string; name: string; price: number }[];
}

export interface SessionPickerProps {
  sessions: Session[];
  timezone: string;
  onSelect: (sessionId: string, ticketTypeId: string) => void;
}

function formatSessionDate(date: Date, timezone: string): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  });
}

function formatSessionTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
}

export function SessionPicker({
  sessions,
  timezone,
  onSelect,
}: SessionPickerProps) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null
  );

  function toggleSession(sessionId: string) {
    setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId));
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">Jadwal belum tersedia</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const isExpanded = expandedSessionId === session.id;
        const isDisabled = session.remainingCapacity === 0;

        return (
          <div
            key={session.id}
            className={`rounded-xl border transition-colors ${
              isDisabled
                ? "border-gray-200 bg-gray-50 opacity-60"
                : "border-gray-200 bg-white hover:border-lelampahan-gold/50"
            }`}
          >
            {/* Session header - clickable to expand/collapse */}
            <button
              type="button"
              onClick={() => !isDisabled && toggleSession(session.id)}
              disabled={isDisabled}
              className={`w-full px-4 py-3 flex items-center justify-between text-left ${
                isDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              aria-expanded={isExpanded}
              aria-disabled={isDisabled}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-gray-900">
                  {formatSessionDate(session.startsAt, timezone)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatSessionTime(session.startsAt, timezone)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium ${
                    isDisabled
                      ? "text-red-500"
                      : session.remainingCapacity <= 5
                        ? "text-orange-600"
                        : "text-green-600"
                  }`}
                >
                  {isDisabled
                    ? "Kuota penuh"
                    : `${session.remainingCapacity} tersisa`}
                </span>

                {!isDisabled && (
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                )}
              </div>
            </button>

            {/* Expanded ticket types */}
            {isExpanded && !isDisabled && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                {session.ticketTypes.map((ticketType) => (
                  <div
                    key={ticketType.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-gray-800">
                        {ticketType.name}
                      </span>
                      <span className="text-xs text-lelampahan-brick font-semibold">
                        {formatIDR(ticketType.price)}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelect(session.id, ticketType.id)}
                    >
                      Pesan
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
