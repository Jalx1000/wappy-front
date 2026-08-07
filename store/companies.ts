"use client";

import { create } from "zustand";
import type { BadgeVariant } from "@/components/ui/Badge";

export type CompanyPlan = "Free" | "Pro" | "Business" | "Enterprise";

export interface CompanyPerson {
  name: string;
  role: string;
  email: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  plan: CompanyPlan;
  seats: number;
  mrr: number;
  location: string;
  since: string;
  people: CompanyPerson[];
}

export const PLAN_META: Record<CompanyPlan, { variant: BadgeVariant }> = {
  Free: { variant: "neutral" },
  Pro: { variant: "primary" },
  Business: { variant: "success" },
  Enterprise: { variant: "warning" },
};

export const COMPANIES_SEED: Company[] = [
  { id: "co1", name: "Acme Corp", domain: "acme.com", industry: "Retail", plan: "Business", seats: 24, mrr: 1200, location: "Madrid, ES", since: "ene 2025",
    people: [
      { name: "Lucía Fernández", role: "Head of Support", email: "lucia@acme.com" },
      { name: "Diego Ramírez", role: "Ops Manager", email: "diego@acme.com" },
      { name: "Marta Ruiz", role: "Agente", email: "marta@acme.com" },
    ] },
  { id: "co2", name: "Globex", domain: "globex.io", industry: "SaaS", plan: "Enterprise", seats: 80, mrr: 5400, location: "Berlin, DE", since: "mar 2024",
    people: [
      { name: "Jonas Weber", role: "VP Customer", email: "jonas@globex.io" },
      { name: "Elena Kraus", role: "Team Lead", email: "elena@globex.io" },
    ] },
  { id: "co3", name: "Initech", domain: "initech.com", industry: "Fintech", plan: "Pro", seats: 8, mrr: 290, location: "London, UK", since: "jun 2025",
    people: [
      { name: "Peter Gibbons", role: "Founder", email: "peter@initech.com" },
    ] },
  { id: "co4", name: "Umbrella", domain: "umbrella.co", industry: "Salud", plan: "Business", seats: 32, mrr: 1600, location: "CDMX, MX", since: "sep 2024",
    people: [
      { name: "Ada Wong", role: "Support Lead", email: "ada@umbrella.co" },
      { name: "Chris Redfield", role: "Agente", email: "chris@umbrella.co" },
      { name: "Jill Valentine", role: "Agente", email: "jill@umbrella.co" },
      { name: "Leon Kennedy", role: "QA", email: "leon@umbrella.co" },
    ] },
  { id: "co5", name: "Hooli", domain: "hooli.com", industry: "SaaS", plan: "Free", seats: 3, mrr: 0, location: "Palo Alto, US", since: "nov 2025",
    people: [
      { name: "Gavin Belson", role: "CEO", email: "gavin@hooli.com" },
    ] },
  { id: "co6", name: "Soylent", domain: "soylent.green", industry: "Alimentación", plan: "Pro", seats: 12, mrr: 480, location: "Bogotá, CO", since: "abr 2025",
    people: [
      { name: "William Simonson", role: "Support Manager", email: "will@soylent.green" },
      { name: "Thea Clark", role: "Agente", email: "thea@soylent.green" },
    ] },
];

type Updater = Company[] | ((p: Company[]) => Company[]);

interface CompaniesState {
  companies: Company[];
  setCompanies: (u: Updater) => void;
}

export const useCompaniesStore = create<CompaniesState>((set) => ({
  companies: COMPANIES_SEED,
  setCompanies: (u) => set((s) => ({ companies: typeof u === "function" ? u(s.companies) : u })),
}));
