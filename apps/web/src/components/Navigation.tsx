"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

// Constants
const NAV_HEIGHT = "72px";

export default function Navigation() {
  const pathname = usePathname();
  const { isLoggedIn, isAdmin, user, mounted, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation items for authenticated users
  const navItems = isAdmin
    ? [
        { href: "/studios", label: "Studios", icon: "🏘️" },
        { href: "/studios/my-studios", label: "Mes Studios", icon: "🏠" },
        { href: "/studios/studio-payments", label: "Bookings", icon: "💰" },
      ]
    : [
        { href: "/studios", label: "Studios", icon: "🏘️" },
        { href: "/studios/my-bookings", label: "Mes Réservations", icon: "📋" },
      ];

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          padding: "0 20px",
          height: NAV_HEIGHT,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(102, 126, 234, 0.35)",
              }}
            >
              <span style={{ fontSize: "22px" }}>🏠</span>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", letterSpacing: "-0.02em" }}>
                StudioRent
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>Location Premium</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <style jsx global>{`
        .nav-link-item {
          position: relative;
          padding: 10px 16px;
          color: #475569;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .nav-link-item:hover {
          color: #667eea;
          background: rgba(102, 126, 234, 0.08);
        }

        .nav-link-item.active {
          color: #667eea;
          background: rgba(102, 126, 234, 0.12);
          font-weight: 600;
        }

        .nav-link-item.active::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .mobile-menu-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: -320px;
          width: 320px;
          height: 100vh;
          background: white;
          z-index: 1001;
          transition: right 0.3s ease;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .mobile-menu.open {
          right: 0;
        }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 1002;
        }

        .hamburger span {
          display: block;
          width: 24px;
          height: 2px;
          background: #1e293b;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        @media (max-width: 1024px) {
          .desktop-nav {
            display: none !important;
          }

          .hamburger {
            display: flex;
          }
        }

        .user-dropdown {
          position: relative;
        }

        .user-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 200px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(0, 0, 0, 0.06);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          z-index: 100;
          overflow: hidden;
        }

        .user-dropdown:hover .user-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .logout-btn {
          width: 100%;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #ef4444;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.08);
        }
      `}</style>

      {/* Navigation Bar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(0, 0, 0, 0.1)" : "1px solid rgba(0, 0, 0, 0.06)",
          padding: "0 20px",
          height: NAV_HEIGHT,
          transition: "all 0.3s ease",
          boxShadow: scrolled ? "0 2px 20px rgba(0, 0, 0, 0.06)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(102, 126, 234, 0.35)",
              }}
            >
              <span style={{ fontSize: "22px" }}>🏠</span>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", letterSpacing: "-0.02em" }}>
                StudioRent
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>Location Premium</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isLoggedIn ? (
              <>
                {/* Navigation Links */}
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link-item ${pathname === item.href ? "active" : ""}`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}

                {/* User Menu */}
                <div className="user-dropdown" style={{ marginLeft: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "6px 12px 6px 6px",
                      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        background: isAdmin
                          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                      }}
                    >
                      {isAdmin ? "⚙️" : "👤"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                        {user?.firstName || "Utilisateur"}
                      </span>
                      <span style={{ fontSize: "10px", color: isAdmin ? "#10b981" : "#667eea", fontWeight: "500" }}>
                        {isAdmin ? "Administrateur" : "Membre"}
                      </span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>▼</span>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="user-menu">
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{user?.email}</div>
                    </div>
                    <Link href="/dashboard" className={`nav-link-item ${pathname === "/dashboard" ? "active" : ""}`}>
                      <span>📊</span>
                      Dashboard
                    </Link>
                    <div style={{ padding: "8px" }}>
                      <button
                        onClick={handleLogout}
                        className="logout-btn"
                      >
                        <span>🚪</span>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/" className={`nav-link-item ${pathname === "/" ? "active" : ""}`}>
                  <span>🏡</span>
                  Accueil
                </Link>
                <Link href="/studios" className={`nav-link-item ${pathname === "/studios" ? "active" : ""}`}>
                  <span>🏘️</span>
                  Studios
                </Link>
                <Link
                  href="/auth/login"
                  style={{
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(102, 126, 234, 0.35)",
                    transition: "all 0.2s ease",
                    marginLeft: "8px",
                  }}
                >
                  <span>🔑</span>
                  Connexion
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`} onClick={closeMobileMenu} />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        {/* Mobile Menu Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "22px" }}>🏠</span>
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>StudioRent</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Location Premium</div>
          </div>
        </div>

        {/* Mobile User Info (if logged in) */}
        {isLoggedIn && (
          <div
            style={{
              padding: "20px",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: isAdmin
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                {isAdmin ? "⚙️" : "👤"}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: "12px", color: isAdmin ? "#10b981" : "#667eea", fontWeight: "500" }}>
                  {isAdmin ? "Administrateur" : "Membre"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Links */}
        <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
          {isLoggedIn ? (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    color: pathname === item.href ? "#667eea" : "#475569",
                    background: pathname === item.href ? "rgba(102, 126, 234, 0.1)" : "transparent",
                    textDecoration: "none",
                    borderRadius: "12px",
                    fontWeight: pathname === item.href ? "600" : "500",
                    fontSize: "15px",
                    marginBottom: "6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </>
          ) : (
            <>
              <Link
                href="/"
                onClick={closeMobileMenu}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  color: pathname === "/" ? "#667eea" : "#475569",
                  background: pathname === "/" ? "rgba(102, 126, 234, 0.1)" : "transparent",
                  textDecoration: "none",
                  borderRadius: "12px",
                  fontWeight: pathname === "/" ? "600" : "500",
                  fontSize: "15px",
                  marginBottom: "6px",
                }}
              >
                <span style={{ fontSize: "20px" }}>🏡</span>
                Accueil
              </Link>
              <Link
                href="/studios"
                onClick={closeMobileMenu}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  color: pathname === "/studios" ? "#667eea" : "#475569",
                  background: pathname === "/studios" ? "rgba(102, 126, 234, 0.1)" : "transparent",
                  textDecoration: "none",
                  borderRadius: "12px",
                  fontWeight: pathname === "/studios" ? "600" : "500",
                  fontSize: "15px",
                  marginBottom: "6px",
                }}
              >
                <span style={{ fontSize: "20px" }}>🏘️</span>
                Studios
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Footer */}
        <div style={{ padding: "16px", borderTop: "1px solid #f1f5f9" }}>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)",
              }}
            >
              <span>🚪</span>
              Déconnexion
            </button>
          ) : (
            <Link
              href="/auth/login"
              onClick={closeMobileMenu}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "14px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "15px",
                boxShadow: "0 4px 14px rgba(102, 126, 234, 0.35)",
              }}
            >
              <span>🔑</span>
              Connexion
            </Link>
          )}
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed nav */}
      <div style={{ height: NAV_HEIGHT }} />
    </>
  );
}
