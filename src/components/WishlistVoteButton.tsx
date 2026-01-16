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

    const checkVote = async () => {
      const { data } = await supabase
        .from("wishlist_votes")
        .select("id")
        .eq("wishlist_entry_id", entryId)
        .eq("voter_identifier", voterId)
        .maybeSingle();

      setHasVoted(!!data);
    };

    checkVote();
  }, [entryId, voterId]);

  const handleVote = async () => {
    if (!voterId || isLoading) return;

    setIsLoading(true);
    
    try {
      if (hasVoted) {
        // Remove vote
        await supabase
          .from("wishlist_votes")
          .delete()
          .eq("wishlist_entry_id", entryId)
          .eq("voter_identifier", voterId);

        // Update vote count on entry
        const newCount = Math.max(0, voteCount - 1);
        await supabase
          .from("wishlist_entries")
          .update({ vote_count: newCount })
          .eq("id", entryId);

        setVoteCount(newCount);
        setHasVoted(false);
        onVoteChange?.(newCount);
      } else {
        // Add vote
        await supabase
          .from("wishlist_votes")
          .insert({
            wishlist_entry_id: entryId,
            voter_identifier: voterId
          });

        // Update vote count on entry
        const newCount = voteCount + 1;
        await supabase
          .from("wishlist_entries")
          .update({ vote_count: newCount })
          .eq("id", entryId);

        setVoteCount(newCount);
        setHasVoted(true);
        onVoteChange?.(newCount);
      }
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