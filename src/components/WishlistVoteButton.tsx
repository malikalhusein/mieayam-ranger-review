import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVoterId } from "@/hooks/useVoterId";
import { cn } from "@/lib/utils";

interface WishlistVoteButtonProps {
  entryId: string;
  initialVoteCount: number;
  onVoteChange?: (newCount: number) => void;
}

export const WishlistVoteButton = ({ 
  entryId, 
  initialVoteCount,
  onVoteChange 
}: WishlistVoteButtonProps) => {
  const voterId = useVoterId();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has already voted
  useEffect(() => {
    if (!voterId) return;
    supabase
      .rpc("has_voted_wishlist", { _entry_id: entryId, _voter_secret: voterId })
      .then(({ data }) => setHasVoted(!!data));
  }, [entryId, voterId]);

  const handleVote = async () => {
    if (!voterId || isLoading) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("toggle_wishlist_vote", {
        _entry_id: entryId,
        _voter_secret: voterId,
      });
      if (error) throw error;
      const result = data as { voted: boolean; vote_count: number };
      setVoteCount(result.vote_count);
      setHasVoted(result.voted);
      onVoteChange?.(result.vote_count);
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={isLoading || !voterId}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        hasVoted 
          ? "bg-primary/10 text-primary border border-primary/30" 
          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/30",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all",
          hasVoted && "fill-primary text-primary scale-110",
          !hasVoted && "hover:scale-110"
        )} 
      />
      <span>{voteCount}</span>
    </button>
  );
};

export default WishlistVoteButton;