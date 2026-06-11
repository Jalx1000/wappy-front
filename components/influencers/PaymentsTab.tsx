"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { INFLUENCERS_DATA, CONTRACTS_DATA } from "@/lib/mocks/analyticsData";

type PaymentStatus = "pendiente" | "pagado" | "retrasado";

interface Payment {
  id: string;
  influencerId: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  type: string;
  reference: string;
}

export function PaymentsTab() {
  const [statusFilter, setStatusFilter] = useState<"todos" | PaymentStatus>("todos");
  const [paymentIdToPay, setPaymentIdToPay] = useState<string | null>(null);

  const payments: Payment[] = useMemo(() => {
    return CONTRACTS_DATA.map((contract) => {
      const inf = INFLUENCERS_DATA.find((i) => i.id === contract.influencerId);
      const dueDate = new Date(contract.expiresAt);
      const today = new Date();
      let status: PaymentStatus = "pendiente";

      if (dueDate < today) {
        status = "retrasado";
      }

      return {
        id: contract.id,
        influencerId: contract.influencerId,
        amount: contract.amount,
        dueDate: contract.expiresAt,
        status: contract.signatureStatus === "firmado" ? status : "pendiente",
        type: contract.type,
        reference: `${inf?.name} - ${contract.type}`,
      };
    });
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "todos") return payments;
    return payments.filter((p) => p.status === statusFilter);
  }, [payments, statusFilter]);

  const stats = useMemo(() => {
    const total = payments.reduce((s, p) => s + p.amount, 0);
    const pending = payments.filter((p) => p.status === "pendiente").reduce((s, p) => s + p.amount, 0);
    const overdue = payments.filter((p) => p.status === "retrasado").reduce((s, p) => s + p.amount, 0);

    return { total, pending, overdue };
  }, [payments]);

  const handlePayment = (id: string) => {
    setPaymentIdToPay(null);
    // In a real app, this would call an API
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "pagado":
        return { bg: "var(--color-success-bg)", text: "var(--color-success)" };
      case "retrasado":
        return { bg: "var(--color-error-bg)", text: "var(--color-error)" };
      case "pendiente":
      default:
        return { bg: "var(--color-warning-bg)", text: "var(--color-warning)" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="fobo-card p-6">
          <div className="text-[12px] font-semibold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
            Total Adeudado
          </div>
          <div className="text-[28px] font-bold mt-3 tnum" style={{ color: "var(--color-text-primary)", fontFamily: "var(--ff-display)" }}>
            ${stats.total.toLocaleString()}
          </div>
          <div className="text-[12px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>
            En 7 contratos
          </div>
        </div>

        <div className="fobo-card p-6">
          <div className="text-[12px] font-semibold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
            Pendientes
          </div>
          <div className="text-[28px] font-bold mt-3 tnum" style={{ color: "var(--color-warning)", fontFamily: "var(--ff-display)" }}>
            ${stats.pending.toLocaleString()}
          </div>
          <div className="text-[12px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>
            Por procesar
          </div>
        </div>

        <div className="fobo-card p-6">
          <div className="text-[12px] font-semibold uppercase" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
            Retrasados
          </div>
          <div className="text-[28px] font-bold mt-3 tnum" style={{ color: "var(--color-error)", fontFamily: "var(--ff-display)" }}>
            ${stats.overdue.toLocaleString()}
          </div>
          <div className="text-[12px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>
            Requieren atención
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["todos", "pendiente", "pagado", "retrasado"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className="px-4 py-2 rounded-full text-[12px] font-medium border-none cursor-pointer transition-all"
            style={{
              background: statusFilter === status ? "var(--color-primary-subtle)" : "var(--color-background)",
              color: statusFilter === status ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
            }}
          >
            {status === "todos"
              ? "Todos"
              : status === "pendiente"
                ? "Pendientes"
                : status === "pagado"
                  ? "Pagados"
                  : "Retrasados"}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="fobo-card">
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h3 className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Pagos ({filtered.length})
          </h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Icon
                name="file"
                size={40}
                style={{ color: "var(--color-text-tertiary)", opacity: 0.3, margin: "0 auto 12px" }}
              />
              <div className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
                No hay pagos con este filtro
              </div>
            </div>
          ) : (
            filtered.map((payment) => {
              const inf = INFLUENCERS_DATA.find((i) => i.id === payment.influencerId);
              const colors = getStatusColor(payment.status);

              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-opacity-50 transition-colors"
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                          style={{ background: inf?.tint || "#0D5CA6" }}
                        >
                          {inf?.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            {payment.reference}
                          </div>
                          <div className="text-[11px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                            {payment.id}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-[16px] font-bold tnum mb-2" style={{ color: "var(--color-text-primary)", fontFamily: "var(--ff-display)" }}>
                        ${payment.amount.toLocaleString()}
                      </div>
                      <Badge
                        variant={
                          payment.status === "pagado"
                            ? "success"
                            : payment.status === "retrasado"
                              ? "error"
                              : "warning"
                        }
                      >
                        {payment.status === "pagado"
                          ? "Pagado"
                          : payment.status === "retrasado"
                            ? "Retrasado"
                            : "Pendiente"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                    <div className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                      Vence: <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{payment.dueDate}</span>
                    </div>
                    {payment.status === "pendiente" && (
                      <button
                        onClick={() => setPaymentIdToPay(payment.id)}
                        className="fobo-btn fobo-btn-primary fobo-btn-sm"
                      >
                        <Icon name="check" size={14} /> Pagar
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {paymentIdToPay && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center"
            style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }}
            onClick={() => setPaymentIdToPay(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fobo-card p-6 max-w-[400px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[16px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                Confirmar Pago
              </div>
              <div className="text-[14px] mb-6" style={{ color: "var(--color-text-secondary)" }}>
                {(() => {
                  const payment = payments.find((p) => p.id === paymentIdToPay);
                  return `¿Procesar pago de $${payment?.amount.toLocaleString()} a ${INFLUENCERS_DATA.find((i) => i.id === payment?.influencerId)?.name}?`;
                })()}
              </div>
              <div className="flex gap-3">
                <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1" onClick={() => setPaymentIdToPay(null)}>
                  Cancelar
                </button>
                <button
                  className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1"
                  onClick={() => {
                    handlePayment(paymentIdToPay);
                  }}
                >
                  Confirmar Pago
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
