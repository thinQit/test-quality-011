'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface TestItem {
  id?: string;
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  uptimeSeconds: number;
  db: 'ok' | 'unavailable';
}

export function Page() {
  const { toast } = useToast();
  const [items, setItems] = useState<TestItem[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const [itemsRes, healthRes] = await Promise.all([
        api.get<{ items: TestItem[]; total: number; page: number; pageSize: number }>(
          '/api/test-items?page=1&pageSize=5&sortBy=createdAt&sortDir=desc'
        ),
        api.get<HealthResponse>('/api/health?detail=true')
      ]);

      if (itemsRes.error) {
        setError(itemsRes.error);
        toast(itemsRes.error, 'error');
      } else {
        setItems(itemsRes.data?.items ?? []);
      }

      if (healthRes.error) {
        toast(healthRes.error, 'warning');
      } else {
        setHealth(healthRes.data ?? null);
      }

      setLoading(false);
    };

    fetchData();
  }, [toast]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter(item => item.status === 'active').length;
    const draft = items.filter(item => item.status === 'draft').length;
    const archived = items.filter(item => item.status === 'archived').length;
    return { total, active, draft, archived };
  }, [items]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Quick overview of your Test Items and system status.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-error">{error}</p>
              <Button onClick={() => window.location.reload()} aria-label="Reload dashboard">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-yellow-600">{stats.draft}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground">Archived</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-500">{stats.archived}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent Test Items</h2>
              <p className="text-sm text-muted-foreground">Latest 5 items created.</p>
            </div>
            <Link href="/test-items" aria-label="View all test items">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="h-6 w-6" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">No Test Items yet. Create the first one.</p>
              <Link href="/test-items/new" aria-label="Create new test item">
                <Button>Create Test Item</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-start justify-between rounded-md border border-border p-3">
                  <div className="space-y-1">
                    <p className="font-medium">{item.name || 'Untitled Item'}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={item.status === 'active' ? 'success' : item.status === 'archived' ? 'secondary' : 'warning'}>
                      {item.status || 'draft'}
                    </Badge>
                    <Link href={`/test-items/${item.id}`} className="text-sm text-primary hover:underline">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">System Health</h2>
        </CardHeader>
        <CardContent>
          {health ? (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={health.status === 'ok' ? 'success' : health.status === 'degraded' ? 'warning' : 'error'}>
                  {health.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Uptime (seconds)</p>
                <p className="font-medium">{health.uptimeSeconds}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Database</p>
                <Badge variant={health.db === 'ok' ? 'success' : 'error'}>{health.db}</Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Health data unavailable.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
