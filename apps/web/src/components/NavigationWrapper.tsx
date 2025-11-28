"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

// Pages where navigation should NOT be displayed
const EXCLUDED_PATHS = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export default function NavigationWrapper() {
  const pathname = usePathname();

  // Check if current path starts with any excluded path
  const shouldHideNavigation = EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (shouldHideNavigation) {
    return null;
  }

  return <Navigation />;
}
