export type StoredUserData = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

export function getStoredUserData(): StoredUserData {
  if (typeof window === "undefined") {
    return {};
  }

  const stored = window.localStorage.getItem("userData");
  if (!stored) {
    return {};
  }

  try {
    return (JSON.parse(stored) as StoredUserData) ?? {};
  } catch {
    return {};
  }
}
