import type { Metadata } from "next";
import { CalendarView } from "@/components/calendar/CalendarView";
export const metadata: Metadata = { title: "Calendario" };
export default function Page() { return <CalendarView />; }
