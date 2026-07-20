import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// The Supabase JS `auth.oauth` namespace is beta and not in generated types yet.
// Use a small typed local wrapper instead of grepping node_modules.
type AuthorizationDetails = {
  client?: { name?: string; redirect_uri?: string };
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
const authOauth = (supabase.auth as any).oauth as {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: any }>;
};

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id in URL.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      setUserEmail(sess.session.user.email ?? null);
      if (!authOauth?.getAuthorizationDetails) {
        setError(
          "OAuth client (supabase.auth.oauth) not available. Please update @supabase/supabase-js."
        );
        return;
      }
      const { data, error } = await authOauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message ?? String(error));
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await authOauth.approveAuthorization(authorizationId)
      : await authOauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message ?? String(error));
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-card">
        <CardHeader>
          <CardTitle>
            {details?.client?.name
              ? `Connect ${details.client.name} to Mie Ayam Ranger`
              : "Authorize connection"}
          </CardTitle>
          <CardDescription>
            {userEmail ? `Signed in as ${userEmail}.` : "Loading…"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {!error && !details && <p className="text-sm text-muted-foreground">Loading authorization request…</p>}
          {details && (
            <>
              <p className="text-sm">
                This lets <strong>{details.client?.name ?? "the client"}</strong> use Mie Ayam Ranger
                as you — it can call the app's enabled tools while you are signed in.
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Share your basic profile and email</li>
                <li>Read reviews and wishlist entries</li>
                <li>Submit wishlist entries as you</li>
                <li>Moderate wishlist entries if you are an admin</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                This does not bypass this app's permissions or backend policies.
              </p>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                  {busy ? "Working…" : "Approve"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => decide(false)}
                >
                  Deny
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
