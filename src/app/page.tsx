'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { api } from '@/lib/api';
import { Test, TestStatus } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

interface TestsResponse {
  items: Test[];
  total: number;
  page: number;
  pageSize: number;
}

const statusOptions: Array<{ label: string; value: 'all' | TestStatus }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' }
];

const statusBadge: Record<TestStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  draft: { label: 'Draft', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  archived: { label: 'Archived', variant: 'secondary' }
};

export default function DashboardPage() {
  const [items, setItems] = useState<Test[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<'all' | TestStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const loadTests = async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      });
      if (query) params.set('q', query);
      if (status !== 'all') params.set('status', status);

      const response = await api.get<TestsResponse>(`/api/tests?${params.toString()}`);
      if (!response || response.error) {
        setError(response?.error || 'Failed to load tests');
        setItems([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      const data = response.data;
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
      setLoading(false);
    };

    loadTests();
  }, [page, pageSize, query, status]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value as 'all' | TestStatus);
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard - Tests</h1>
          <p className="text-sm text-secondary">Search, filter, and manage tests.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/tests/new" className="text-primary hover:underline">
            New Test
          </Link>
          <Link href="/tests/import" className="text-primary hover:underline">
            Import CSV
          </Link>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-medium">Filters</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-end">
            <Input
              label="Search by title"
              value={searchInput}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchInput(event.target.value)}
              placeholder="Search tests"
            />
            <div className="space-y-1">
              <label htmlFor="status" className="block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={handleStatusChange}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="primary">Apply</Button>
            <a
              href={`/api/tests/export?${new URLSearchParams({
                ...(query ? { q: query } : {}),
                ...(status !== 'all' ? { status } : {})
              }).toString()}`}
              className="text-sm text-primary hover:underline"
            >
              Export CSV
            </a>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-medium">Tests</h2>
            <p className="text-sm text-secondary">Total: {total}</p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <div className="rounded-md border border-error bg-red-50 p-4 text-sm text-error">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-secondary">
              No tests found. Try adjusting your filters or create a new test.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-secondary">
                  <tr>
                    <th className="py-2">Title</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Created</th>
                    <th className="py-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(test => (
                    <tr key={test.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3">
                        <Link href={`/tests/${test.id}`} className="text-primary hover:underline">
                          {test.title}
                        </Link>
                      </td>
                      <td className="py-3">
                        <Badge variant={statusBadge[test.status].variant}>
                          {statusBadge[test.status].label}
                        </Badge>
                      </td>
                      <td className="py-3 text-secondary">
                        {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 text-secondary">
                        {test.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 md:flex-row">
              <p className="text-sm text-secondary">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
