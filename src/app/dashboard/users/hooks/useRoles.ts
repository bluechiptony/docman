"use client";

import { useState, useEffect } from "react";

export function useRoles() {
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then(setRoles)
      .catch(() => setRoles(["viewer", "editor", "admin"])); // fallback
  }, []);

  return { roles };
}
