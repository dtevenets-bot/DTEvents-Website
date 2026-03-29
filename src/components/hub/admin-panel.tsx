'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ShieldCheckIcon, GiftIcon, NoSymbolIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ActionState {
  loading: boolean;
  success: string | null;
  error: string | null;
}

export function AdminPanel() {
  const [grantState, setGrantState] = useState<ActionState>({
    loading: false,
    success: null,
    error: null,
  });
  const [revokeState, setRevokeState] = useState<ActionState>({
    loading: false,
    success: null,
    error: null,
  });

  const [grantUserId, setGrantUserId] = useState('');
  const [grantProductId, setGrantProductId] = useState('');
  const [revokeUserProductId, setRevokeUserProductId] = useState('');

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantState({ loading: true, success: null, error: null });

    try {
      const res = await fetch('/api/admin/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: grantUserId,
          productId: grantProductId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to grant product');
      }

      setGrantState({ loading: false, success: data.message, error: null });
      setGrantUserId('');
      setGrantProductId('');
    } catch (err) {
      setGrantState({
        loading: false,
        success: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevokeState({ loading: true, success: null, error: null });

    try {
      const res = await fetch('/api/admin/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProductId: revokeUserProductId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to revoke product');
      }

      setRevokeState({ loading: false, success: data.message, error: null });
      setRevokeUserProductId('');
    } catch (err) {
      setRevokeState({
        loading: false,
        success: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheckIcon className="size-5" />
          Admin Panel
        </h2>
        <p className="text-sm text-soft-fg">
          Manage product grants and revocations.
        </p>
      </div>

      <Tabs defaultValue="grant">
        <TabsList>
          <TabsTrigger value="grant">
            <GiftIcon className="size-3.5 mr-1" />
            Grant Product
          </TabsTrigger>
          <TabsTrigger value="revoke">
            <NoSymbolIcon className="size-3.5 mr-1" />
            Revoke Product
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grant">
          <Card>
            <CardHeader>
              <CardTitle>Grant a Product</CardTitle>
              <CardDescription>
                Give a product to a user by their Roblox User ID.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGrant} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grant-user-id">User Roblox ID</Label>
                  <Input
                    id="grant-user-id"
                    placeholder="Enter Roblox User ID"
                    value={grantUserId}
                    onChange={(e) => setGrantUserId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grant-product-id">Product ID</Label>
                  <Input
                    id="grant-product-id"
                    placeholder="Enter Product ID"
                    value={grantProductId}
                    onChange={(e) => setGrantProductId(e.target.value)}
                    required
                  />
                </div>

                {grantState.error && (
                  <p className="text-sm text-err">{grantState.error}</p>
                )}
                {grantState.success && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircleIcon className="size-4" />
                    {grantState.success}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={grantState.loading || !grantUserId || !grantProductId}
                  className="hover:bg-ink/90"
                >
                  {grantState.loading && <ArrowPathIcon className="size-4 animate-spin" />}
                  {grantState.loading ? 'Granting...' : 'Grant Product'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revoke">
          <Card>
            <CardHeader>
              <CardTitle>Revoke a Product</CardTitle>
              <CardDescription>
                Revoke a user&apos;s product access by the User Product ID.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRevoke} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="revoke-user-product-id">User Product ID</Label>
                  <Input
                    id="revoke-user-product-id"
                    placeholder="Enter User Product ID"
                    value={revokeUserProductId}
                    onChange={(e) => setRevokeUserProductId(e.target.value)}
                    required
                  />
                </div>

                {revokeState.error && (
                  <p className="text-sm text-err">{revokeState.error}</p>
                )}
                {revokeState.success && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircleIcon className="size-4" />
                    {revokeState.success}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="destructive"
                  disabled={revokeState.loading || !revokeUserProductId}
                >
                  {revokeState.loading && <ArrowPathIcon className="size-4 animate-spin" />}
                  {revokeState.loading ? 'Revoking...' : 'Revoke Product'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
