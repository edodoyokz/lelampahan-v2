"use client";

import { useRouter } from "next/navigation";
import { SessionPicker, type Session } from "@/components/feature/session-picker";

interface ListingDetailClientProps {
  sessions: {
    id: string;
    startsAt: string;
    capacity: number;
    remainingCapacity: number;
    ticketTypes: { id: string; name: string; price: number }[];
  }[];
  timezone: string;
}

export function ListingDetailClient({ sessions, timezone }: ListingDetailClientProps) {
  const router = useRouter();

  // Convert ISO strings back to Date objects for SessionPicker
  const parsedSessions: Session[] = sessions.map((s) => ({
    ...s,
    startsAt: new Date(s.startsAt),
  }));

  function handleSelect(sessionId: string, ticketTypeId: string) {
    router.push(`/checkout?sessionId=${sessionId}&ticketTypeId=${ticketTypeId}`);
  }

  return (
    <SessionPicker
      sessions={parsedSessions}
      timezone={timezone}
      onSelect={handleSelect}
    />
  );
}
