import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, MapPin, Loader2, Store } from "lucide-react";

interface WishlistEntry {
  id: string;
  place_name: string;
  location: string;
  notes: string | null;
  status: string;
  created_at: string;
}

const WishlistAdmin = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchAllEntries();
  }, []);

  const fetchAllEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wishlist_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error:", error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdating(id);
    const { error } = await supabase
      .from("wishlist_entries")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `Entry ${status}` });
      fetchAllEntries();
    }
    setUpdating(null);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Hapus entry ini?")) return;
    const { error } = await supabase.from("wishlist_entries").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", variant: "destructive" });
    } else {
      toast({ title: "Entry dihapus" });
      fetchAllEntries();
    }
  };

  const pendingEntries = entries.filter(e => e.status === "pending");
  const approvedEntries = entries.filter(e => e.status === "approved");

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Wishlist Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">Pending ({pendingEntries.length})</h3>
          {pendingEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">Tidak ada entry pending</p>
          ) : (
            <div className="space-y-3">
              {pendingEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/10">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{entry.place_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                      </p>
                      {entry.notes && <p className="text-sm mt-1 italic">"{entry.notes}"</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(entry.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(entry.id, "approved")}
                        disabled={updating === entry.id}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(entry.id, "rejected")}
                        disabled={updating === entry.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="font-semibold mt-6">Approved ({approvedEntries.length})</h3>
          {approvedEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">Tidak ada entry approved</p>
          ) : (
            <div className="space-y-2">
              {approvedEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{entry.place_name}</p>
                    <Badge variant="outline" className="text-xs">Approved</Badge>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteEntry(entry.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistAdmin;
