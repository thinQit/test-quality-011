'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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

export function Page() {
  const { toast } = useToast();
  const [items, setItems] = useState<TestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortBy: 'createdAt',
      sortDir: 'desc'
    });
    if (query) params.set('q', query);
    if (status) params.set('status', status);

    const res = await api.get<{ items: TestItem[]; total: number; page: number; pageSize: number }>(
      `/api/test-items?${params.toString()}`
    );

    if (res.error) {
      setError(res.error);
      toast(res.error, 'error');
    } else {
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    }

    setLoading(false);
  }, [page, pageSize, query, status, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = () => {
    setPage(1);
    fetchItems();
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Test Items</h1>
          <p className="text-muted-foreground">Search, filter, and manage your Test Items.</p>
        </div>
        <Link href="/test-items/new" aria-label="Create test item">
          <Button>Create Test Item</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid flex-1 gap-3 md:grid-cols-3">
              <Input
                label="Search by name"
                placeholder="Type a name"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select
                  value={status}
                  onChange={event => setStatus(event.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={handleSearch} aria-label="Apply search">
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setQuery('');
                    setStatus('');
                    setPage(1);
                  }}
                  aria-label="Clear filters"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-error">{error}</p>
              <Button onClick={fetchItems} aria-label="Retry">Retry</Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">No Test Items found for the selected filters.</p>
              <Link href="/test-items/new" aria-label="Create new test item">
                <Button>Create Test Item</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3">
                {items.map(item => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-md border border-border p-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{item.name || 'Untitled Item'}</p>
                      <p className="text-sm text-muted-foreground">{item.description || 'No description provided.'}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={item.status === 'active' ? 'success' : item.status === 'archived' ? 'secondary' : 'warning'}>
                        {item.status || 'draft'}
                      </Badge>
                      <Link href={`/test-items/${item.id}`} className="text-sm text-primary hover:underline" aria-label={`View ${item.name || 'item'}`}>
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
