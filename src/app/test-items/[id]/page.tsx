'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
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

export function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [item, setItem] = useState<TestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      const res = await api.get<TestItem>(`/api/test-items/${params.id}`);
      if (res.error) {
        setError(res.error);
        toast(res.error, 'error');
      } else {
        setItem(res.data ?? null);
      }
      setLoading(false);
    };

    fetchItem();
  }, [params.id, toast]);

  const handleUpdate = async () => {
    if (!item) return;
    setSaving(true);
    setError(null);

    const res = await api.put<TestItem>(`/api/test-items/${params.id}`, {
      name: item.name,
      description: item.description,
      status: item.status
    });

    if (res.error) {
      setError(res.error);
      toast(res.error, 'error');
    } else {
      toast('Test Item updated successfully', 'success');
      setItem(res.data ?? item);
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    const res = await api.delete<null>(`/api/test-items/${params.id}`);
    if (res.error) {
      toast(res.error, 'error');
      setSaving(false);
      return;
    }
    toast('Test Item deleted', 'success');
    router.push('/test-items');
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Test Item Details</h1>
          <Link href="/test-items" className="text-sm text-primary hover:underline" aria-label="Back to list">
            Back to list
          </Link>
        </div>
        <p className="text-muted-foreground">Review and update the details for this Test Item.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-error">{error}</p>
              <Button onClick={() => router.refresh()} aria-label="Retry">Retry</Button>
            </div>
          </CardContent>
        </Card>
      ) : item ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{item.name || 'Untitled Item'}</h2>
                <p className="text-sm text-muted-foreground">
                  Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <Badge variant={item.status === 'active' ? 'success' : item.status === 'archived' ? 'secondary' : 'warning'}>
                {item.status || 'draft'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Name"
                value={item.name ?? ''}
                onChange={event => setItem(prev => ({ ...prev, name: event.target.value }))}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={item.description ?? ''}
                  onChange={event => setItem(prev => ({ ...prev, description: event.target.value }))}
                  className="min-h-[140px] w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add a description"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select
                  value={item.status ?? 'draft'}
                  onChange={event => setItem(prev => ({ ...prev, status: event.target.value as TestItem['status'] }))}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              {error && <p className="text-sm text-error">{error}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleUpdate} loading={saving} aria-label="Save changes">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => router.back()} aria-label="Cancel changes">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => setShowDelete(true)} aria-label="Delete test item">
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">Test Item not found.</p>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Test Item">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this Test Item? This action cannot be undone.</p>
          <div className="flex items-center gap-3">
            <Button variant="destructive" onClick={handleDelete} loading={saving} aria-label="Confirm delete">
              Delete
            </Button>
            <Button variant="outline" onClick={() => setShowDelete(false)} aria-label="Cancel delete">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Page;
