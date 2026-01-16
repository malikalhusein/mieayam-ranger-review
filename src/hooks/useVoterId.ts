import { useState, useEffect } from "react";

const VOTER_ID_KEY = "mieayam-voter-id";

// Generate a unique voter ID for anonymous voting
const generateVoterId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
};

export const useVoterId = () => {
  const [voterId, setVoterId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem(VOTER_ID_KEY);
    if (!id) {
      id = generateVoterId();
      localStorage.setItem(VOTER_ID_KEY, id);
    }
    setVoterId(id);
  }, []);

  return voterId;
};

export default useVoterId;