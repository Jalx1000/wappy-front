"use client";

import { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { INFLUENCERS_DATA } from "@/lib/mocks/analyticsData";

interface AvailabilityState {
  [influencerId: string]: number[];
}

export function AvailabilityTab() {
  const [booked, setBooked] = useState<AvailabilityState>({
    i1: [3, 4, 9, 10, 18, 19, 25],
    i2: [5, 6, 7, 12, 13, 14, 20, 21, 27, 28],
    i3: [11, 12, 17, 18],
    i4: [2, 3, 23, 24],
    i5: [],
    i6: [9, 10, 11, 26, 27],
    i7: [16, 17, 18, 30],
  });

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const toggle = (influencerId: string, day: number) => {
    setBooked((prev) => ({
      ...prev,
      [influencerId]: prev[influencerId]?.includes(day)
        ? prev[influencerId].filter((d) => d !== day)
        : [...(prev[influencerId] || []), day],
    }));
  };

  const stats = useMemo(() => {
    const withBookings = Object.values(booked).filter((b) => b.length > 0).length;
    const totalBooked = Object.values(booked).reduce((s, b) => s + b.length, 0);
    const freeToday = INFLUENCERS_DATA.filter((i) => !booked[i.id]?.includes(9)).length;

    return { withBookings, totalBooked, freeToday };
  }, [booked]);

  const nextFree = (influencerId: string) => {
    const bookedSet = new Set(booked[influencerId] || []);
    for (let d = 9; d <= 30; d++) {
      if (!bookedSet.has(d)) return d;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="fobo-card p-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--color-secondary-subtle)" }}
          >
            <Icon name="users" size={18} style={{ color: "var(--color-secondary-ink)" }} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
              Creadores en agenda
            </div>
            <div className="text-[18px] font-bold" style={{ color: "var(--color-secondary-ink)", fontFamily: "var(--ff-display)" }}>
              {stats.withBookings}
              <span className="text-[12px] font-normal" style={{ color: "var(--color-text-tertiary)", marginLeft: 4 }}>
                de {INFLUENCERS_DATA.length}
              </span>
            </div>
          </div>
        </div>

        <div className="fobo-card p-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--color-warning-bg)" }}
          >
            <Icon name="calendar" size={18} style={{ color: "var(--color-warning)" }} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
              Días reservados
            </div>
            <div className="text-[18px] font-bold" style={{ color: "var(--color-warning)", fontFamily: "var(--ff-display)" }}>
              {stats.totalBooked}
            </div>
          </div>
        </div>

        <div className="fobo-card p-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--color-success-bg)" }}
          >
            <Icon name="check2" size={18} style={{ color: "var(--color-success-dark)" }} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
              Libres hoy (9 jun)
            </div>
            <div className="text-[18px] font-bold" style={{ color: "var(--color-success-dark)", fontFamily: "var(--ff-display)" }}>
              {stats.freeToday}
            </div>
          </div>
        </div>
      </div>

      {/* Availability Grid - Pixel perfect matching design system */}
      <div className="fobo-card overflow-hidden">
        {/* Header */}
        <div
          className="flex border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          {/* Left: Creador label */}
          <div
            className="text-[10.5px] font-bold uppercase flex items-center"
            style={{
              width: "180px",
              color: "var(--color-text-tertiary)",
              letterSpacing: "0.05em",
              padding: "10px 16px",
              flexShrink: 0,
            }}
          >
            Creador
          </div>

          {/* Right: Days */}
          <div
            className="flex-1 gap-[3px] p-[8px_14px]"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(30, minmax(0, 1fr))",
            }}
          >
            {days.map((d) => {
              const isWeekend = (d - 1) % 7 >= 5;
              return (
                <div
                  key={`header-${d}`}
                  className="text-center text-[9px] font-semibold"
                  style={{
                    color: isWeekend ? "var(--color-text-disabled)" : "var(--color-text-tertiary)",
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows per influencer */}
        {INFLUENCERS_DATA.map((inf, idx) => {
          const bookedSet = new Set(booked[inf.id] || []);
          const nf = nextFree(inf.id);

          return (
            <div
              key={inf.id}
              className="flex border-b"
              style={{
                borderColor: idx < INFLUENCERS_DATA.length - 1 ? "var(--color-border)" : "transparent",
              }}
            >
              {/* Left: Creator info */}
              <div
                className="flex items-center gap-[9px]"
                style={{
                  width: "180px",
                  flexShrink: 0,
                  minWidth: 0,
                  padding: "9px 16px",
                }}
              >
                <div
                  className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 text-white text-[12px] font-bold"
                  style={{ background: inf.tint || "#0D5CA6" }}
                >
                  {inf.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div
                    className="text-[12.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {inf.name}
                  </div>
                  <div className="text-[10.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                    Libre desde {nf ? `${nf} jun` : "—"}
                  </div>
                </div>
              </div>

              {/* Right: Days grid */}
              <div
                className="flex-1 gap-[3px]"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(30, minmax(0, 1fr))",
                  padding: "7px 14px",
                }}
              >
                {days.map((d) => {
                  const isBooked = bookedSet.has(d);
                  const isWeekend = (d - 1) % 7 >= 5;

                  return (
                    <div
                      key={`${inf.id}-${d}`}
                      onClick={() => toggle(inf.id, d)}
                      className="rounded cursor-pointer transition-colors hover:opacity-80"
                      style={{
                        aspectRatio: "1",
                        borderRadius: "4px",
                        background: isBooked
                          ? inf.tint || "#0D5CA6"
                          : isWeekend
                            ? "var(--color-background)"
                            : "var(--color-surface)",
                        border: isBooked ? "none" : "1px solid var(--color-border)",
                      }}
                      title={`${d} jun · ${isBooked ? "reservado" : "disponible"}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div
          className="flex items-center gap-[14px] text-[11.5px]"
          style={{
            borderTop: "1px solid var(--color-border)",
            color: "var(--color-text-tertiary)",
            padding: "12px 16px",
          }}
        >
          <span className="inline-flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: "var(--color-primary)" }}
            />
            Reservado
          </span>
          <span className="inline-flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            />
            Disponible
          </span>
        </div>
      </div>
    </div>
  );
}
