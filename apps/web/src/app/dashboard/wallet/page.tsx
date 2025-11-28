"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";

interface WalletBalance {
  correspondent: string;
  country: string;
  currency: string;
  availableBalance: string;
}

interface PayoutForm {
  phoneNumber: string;
  provider: string;
  amount: string;
  customerMessage: string;
}

export default function WalletPage() {
  const { isLoggedIn, isAdmin, user, mounted, logout } = useAuth();
  const router = useRouter();

  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payout state
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutForm, setPayoutForm] = useState<PayoutForm>({
    phoneNumber: "",
    provider: "",
    amount: "",
    customerMessage: "Transfert wallet",
  });
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutResult, setPayoutResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const providers = [
    { value: "ORANGE_CMR", label: "Orange Money Cameroun" },
    { value: "MTN_MOMO_CMR", label: "MTN Mobile Money Cameroun" },
  ];

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push("/auth/login");
    }
  }, [mounted, isLoggedIn, router]);

  useEffect(() => {
    if (mounted && isLoggedIn && isAdmin) {
      fetchWalletBalances();
    }
  }, [mounted, isLoggedIn, isAdmin]);

  const fetchWalletBalances = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/pawapay/wallet-balances");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de la récupération des soldes");
      }

      const data = await response.json();
      // PawaPay returns an array of balances or an object with balances
      if (Array.isArray(data)) {
        setBalances(data);
      } else if (data.balances && Array.isArray(data.balances)) {
        setBalances(data.balances);
      } else {
        // Empty balances or unexpected format
        setBalances([]);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);
    setPayoutResult(null);

    const cleanedPhone = payoutForm.phoneNumber.replace(/\D/g, "");

    if (cleanedPhone.length < 9 || cleanedPhone.length > 15) {
      setPayoutResult({
        success: false,
        message: "Le numéro de téléphone doit contenir entre 9 et 15 chiffres",
      });
      setPayoutLoading(false);
      return;
    }

    const amountNumber = parseFloat(payoutForm.amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setPayoutResult({
        success: false,
        message: "Le montant doit être un nombre positif",
      });
      setPayoutLoading(false);
      return;
    }

    const payoutId = crypto.randomUUID();

    try {
      const response = await fetch("/api/pawapay/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payoutId,
          amount: payoutForm.amount,
          currency: "XAF",
          recipient: {
            type: "MMO",
            accountDetails: {
              phoneNumber: cleanedPhone,
              provider: payoutForm.provider,
            },
          },
          clientReferenceId: `WALLET-${Date.now()}`,
          customerMessage: payoutForm.customerMessage || "Transfert wallet",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du transfert");
      }

      setPayoutResult({
        success: true,
        message: `Transfert initié avec succès! Référence: ${payoutId}`,
      });

      // Reset form
      setPayoutForm({
        phoneNumber: "",
        provider: "",
        amount: "",
        customerMessage: "Transfert wallet",
      });

      // Refresh balances after successful payout
      setTimeout(() => {
        fetchWalletBalances();
      }, 2000);
    } catch (err) {
      console.error("Erreur payout:", err);
      setPayoutResult({
        success: false,
        message: err instanceof Error ? err.message : "Erreur lors du transfert",
      });
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return `0 ${currency}`;
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numAmount) + ` ${currency}`;
  };

  const getProviderIcon = (correspondent: string) => {
    if (correspondent.includes("ORANGE")) return "🟠";
    if (correspondent.includes("MTN")) return "🟡";
    return "📱";
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      CMR: "🇨🇲",
      CIV: "🇨🇮",
      SEN: "🇸🇳",
      GHA: "🇬🇭",
      NGA: "🇳🇬",
      UGA: "🇺🇬",
      RWA: "🇷🇼",
      MWI: "🇲🇼",
      ZMB: "🇿🇲",
    };
    return flags[country] || "🌍";
  };

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #e2e8f0",
              borderTopColor: "#667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <p style={{ color: "#64748b", fontSize: "1rem" }}>Chargement...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <span style={{ fontSize: "48px" }}>🔒</span>
          <h2 style={{ marginTop: "20px", color: "#1e293b" }}>Accès Refusé</h2>
          <p style={{ color: "#64748b", marginTop: "10px" }}>
            Cette page est réservée aux administrateurs.
          </p>
          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Retour au Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        {/* Navigation Header */}
        <header
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            padding: "16px 0",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div className="container">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>🏠</span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "white",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    StudioRent
                  </div>
                  <div
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}
                  >
                    Wallet PawaPay
                  </div>
                </div>
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Link
                  href="/dashboard"
                  style={{
                    padding: "10px 16px",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "10px",
                    fontWeight: "500",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span>⬅️</span> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "10px 16px",
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.25)",
                  }}
                >
                  <span>🚪</span> Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: "40px 0 60px" }}>
          <div className="container">
            {/* Page Title */}
            <div style={{ marginBottom: "40px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                }}
              >
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    borderRadius: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
                  }}
                >
                  <span style={{ fontSize: "36px" }}>💰</span>
                </div>
                <div>
                  <h1
                    style={{
                      color: "white",
                      fontSize: "2rem",
                      fontWeight: "800",
                      margin: 0,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Mon Wallet PawaPay
                  </h1>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "1rem",
                      margin: "6px 0 0",
                    }}
                  >
                    Consultez vos soldes et effectuez des transferts
                  </p>
                </div>
              </div>
            </div>

            {/* Balances Section */}
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid rgba(255,255,255,0.1)",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    color: "white",
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>📊</span> Soldes Disponibles
                </h2>
                <button
                  onClick={fetchWalletBalances}
                  disabled={loading}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {loading ? "⏳" : "🔄"} Actualiser
                </button>
              </div>

              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "3px solid rgba(255,255,255,0.2)",
                      borderTopColor: "#10b981",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 16px",
                    }}
                  ></div>
                  Chargement des soldes...
                </div>
              ) : error ? (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "12px",
                    padding: "20px",
                    color: "#fca5a5",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "24px", display: "block", marginBottom: "10px" }}>⚠️</span>
                  {error}
                </div>
              ) : balances.length === 0 ? (
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    padding: "40px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <span style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>📭</span>
                  Aucun solde disponible pour le moment
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {balances.map((balance, index) => (
                    <div
                      key={index}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "16px",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>
                          {getProviderIcon(balance.correspondent)}
                        </span>
                        <div>
                          <div
                            style={{
                              color: "white",
                              fontWeight: "600",
                              fontSize: "0.95rem",
                            }}
                          >
                            {balance.correspondent}
                          </div>
                          <div
                            style={{
                              color: "rgba(255,255,255,0.5)",
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {getCountryFlag(balance.country)} {balance.country}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          color: "#10b981",
                          fontSize: "1.5rem",
                          fontWeight: "700",
                        }}
                      >
                        {formatCurrency(
                          balance.availableBalance,
                          balance.currency
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payout Section */}
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    color: "white",
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>💸</span> Effectuer un Transfert
                </h2>
                <button
                  onClick={() => setShowPayoutForm(!showPayoutForm)}
                  style={{
                    padding: "10px 20px",
                    background: showPayoutForm
                      ? "rgba(239, 68, 68, 0.2)"
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {showPayoutForm ? "❌ Annuler" : "➕ Nouveau Transfert"}
                </button>
              </div>

              {showPayoutForm && (
                <form onSubmit={handlePayoutSubmit}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "20px",
                      marginBottom: "24px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.9rem",
                          marginBottom: "8px",
                        }}
                      >
                        Numéro de téléphone *
                      </label>
                      <input
                        type="tel"
                        value={payoutForm.phoneNumber}
                        onChange={(e) =>
                          setPayoutForm({
                            ...payoutForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="Ex: 237699123456"
                        required
                        disabled={payoutLoading}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "10px",
                          color: "white",
                          fontSize: "1rem",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.9rem",
                          marginBottom: "8px",
                        }}
                      >
                        Opérateur *
                      </label>
                      <select
                        value={payoutForm.provider}
                        onChange={(e) =>
                          setPayoutForm({
                            ...payoutForm,
                            provider: e.target.value,
                          })
                        }
                        required
                        disabled={payoutLoading}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "10px",
                          color: "white",
                          fontSize: "1rem",
                        }}
                      >
                        <option value="" style={{ background: "#1e293b" }}>
                          Sélectionnez un opérateur
                        </option>
                        {providers.map((p) => (
                          <option
                            key={p.value}
                            value={p.value}
                            style={{ background: "#1e293b" }}
                          >
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.9rem",
                          marginBottom: "8px",
                        }}
                      >
                        Montant (FCFA) *
                      </label>
                      <input
                        type="number"
                        value={payoutForm.amount}
                        onChange={(e) =>
                          setPayoutForm({
                            ...payoutForm,
                            amount: e.target.value,
                          })
                        }
                        placeholder="Ex: 10000"
                        required
                        min="1"
                        disabled={payoutLoading}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "10px",
                          color: "white",
                          fontSize: "1rem",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.9rem",
                          marginBottom: "8px",
                        }}
                      >
                        Message (optionnel)
                      </label>
                      <input
                        type="text"
                        value={payoutForm.customerMessage}
                        onChange={(e) =>
                          setPayoutForm({
                            ...payoutForm,
                            customerMessage: e.target.value,
                          })
                        }
                        placeholder="Message pour le destinataire"
                        maxLength={22}
                        disabled={payoutLoading}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "10px",
                          color: "white",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                  </div>

                  {payoutResult && (
                    <div
                      style={{
                        background: payoutResult.success
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                        border: `1px solid ${
                          payoutResult.success
                            ? "rgba(16, 185, 129, 0.3)"
                            : "rgba(239, 68, 68, 0.3)"
                        }`,
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "20px",
                        color: payoutResult.success ? "#6ee7b7" : "#fca5a5",
                      }}
                    >
                      {payoutResult.success ? "✅" : "❌"} {payoutResult.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      payoutLoading ||
                      !payoutForm.phoneNumber ||
                      !payoutForm.provider ||
                      !payoutForm.amount
                    }
                    style={{
                      padding: "14px 28px",
                      background:
                        payoutLoading ||
                        !payoutForm.phoneNumber ||
                        !payoutForm.provider ||
                        !payoutForm.amount
                          ? "rgba(255,255,255,0.1)"
                          : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor:
                        payoutLoading ||
                        !payoutForm.phoneNumber ||
                        !payoutForm.provider ||
                        !payoutForm.amount
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "1rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      maxWidth: "300px",
                    }}
                  >
                    {payoutLoading ? (
                      <>
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        ></div>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        💸 Envoyer{" "}
                        {payoutForm.amount
                          ? formatCurrency(payoutForm.amount, "XAF")
                          : ""}
                      </>
                    )}
                  </button>
                </form>
              )}

              {!showPayoutForm && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    padding: "30px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "48px",
                      display: "block",
                      marginBottom: "16px",
                    }}
                  >
                    📲
                  </span>
                  <p>
                    Cliquez sur &quot;Nouveau Transfert&quot; pour envoyer de l&apos;argent
                    vers un numéro Orange ou MTN Mobile Money.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          style={{
            background: "rgba(0,0,0,0.3)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "24px 0",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.85rem",
                  margin: 0,
                }}
              >
                © 2024 StudioRent. Tous droits réservés.
              </p>
              <Link
                href="/dashboard"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                Retour au dashboard →
              </Link>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
