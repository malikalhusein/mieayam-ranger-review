import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, X, MapPin, Loader2, Store, RotateCcw, Trash2 } from "lucide-react";

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

  const sendApprovalEmail = async (entry: WishlistEntry) => {
    try {
      const { error } = await supabase.functions.invoke("send-wishlist-notification", {
        body: {
          place_name: entry.place_name,
          location: entry.location,
        },
      });

      if (error) {
        console.error("Email notification error:", error);
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    setUpdating(id);
    const entry = entries.find((e) => e.id === id);
    
    const { error } = await supabase
      .from("wishlist_entries")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `Entry ${status}` });
      
      // Send email notification if approved
      if (status === "approved" && entry) {
        await sendApprovalEmail(entry);
      }
      
      fetchAllEntries();
    }
    setUpdating(null);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Hapus entry ini secara permanen?")) return;
    setUpdating(id);
    const { error } = await supabase.from("wishlist_entries").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", variant: "destructive" });
    } else {
      toast({ title: "Entry dihapus permanen" });
      fetchAllEntries();
    }
    setUpdating(null);
  };

  const pendingEntries = entries.filter((e) => e.status === "pending");
  const approvedEntries = entries.filter((e) => e.status === "approved");
  const rejectedEntries = entries.filter((e) => e.status === "rejected");

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Wishlist Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex gap-2">
              Pending
              {pendingEntries.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingEntries.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex gap-2">
              Approved
              {approvedEntries.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {approvedEntries.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex gap-2">
              Rejected
              {rejectedEntries.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {rejectedEntries.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-3 mt-4">
            {pendingEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Tidak ada entry pending
              </p>
            ) : (
              pendingEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/10"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{entry.place_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                      </p>
                      {entry.notes && (
                        <p className="text-sm mt-1 italic">"{entry.notes}"</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(entry.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(entry.id, "approved")}
                        disabled={updating === entry.id}
                        title="Approve"
                      >
                        {updating === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(entry.id, "rejected")}
                        disabled={updating === entry.id}
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved" className="space-y-2 mt-4">
            {approvedEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Tidak ada entry approved
              </p>
            ) : (
              approvedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{entry.place_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {entry.location}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      Approved
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteEntry(entry.id)}
                    disabled={updating === entry.id}
                    title="Delete"
                  >
                    {updating === entry.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected" className="space-y-2 mt-4">
            {rejectedEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Tidak ada entry rejected
              </p>
            ) : (
              rejectedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-3 bg-red-50 dark:bg-red-900/10"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{entry.place_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                      </p>
                      {entry.notes && (
                        <p className="text-sm mt-1 italic">"{entry.notes}"</p>
                      )}
                      <Badge variant="outline" className="text-xs mt-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Rejected
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(entry.id, "pending")}
                        disabled={updating === entry.id}
                        title="Reconsider (move to pending)"
                      >
                        {updating === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteEntry(entry.id)}
                        disabled={updating === entry.id}
                        title="Delete permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WishlistAdmin;
