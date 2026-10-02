import { useState, useEffect } from "react";

const VOTER_ID_KEY = "mieayam-voter-id";

// Private random secret for anonymous voting. Only its hash is stored server-side.
const generateVoterId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

export const useVoterId = () => {
  const [voterId, setVoterId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem(VOTER_ID_KEY);
    if (!id || id.length < 16) {
      id = generateVoterId();
      localStorage.setItem(VOTER_ID_KEY, id);
    }
    setVoterId(id);
  }, []);

  return voterId;
};

export default useVoterId;
