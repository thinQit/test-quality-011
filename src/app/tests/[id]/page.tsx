'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Test, TestStatus } from '@/types';
import { useToast } from '@/providers/ToastProvider';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';

const statusBadge: Record<TestStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  draft: { label: 'Draft', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  archived: { label: 'Archived', variant: 'default' }
};

export default function TestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TestStatus>('draft');

  useEffect(() => {
    const loadTest = async () => {
      setLoading(true);
      setError(null);
      const response = await api.get<Test>(`/api/tests/${params.id}`);
      if (!response || response.error) {
        setError(response?.error || 'Failed to load test.');
        setLoading(false);
        return;
      }
      const data = response.data;
      setTest(data ?? null);
      setTitle(data?.title ?? '');
      setDescription(data?.description ?? '');
      setStatus(data?.status ?? 'draft');
      setLoading(false);
    };

    loadTest();
  }, [params.id]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    setError(null);
    const response = await api.put<Test>(`/api/tests/${params.id}`, {
      title: title.trim(),
      description: description.trim() || undefined,
      status
    });

    if (!response || response.error) {
      setError(response?.error || 'Failed to update test.');
      setSaving(false);
      return;
    }

    const updated = response.data;
    setTest(updated ?? null);
    setSaving(false);
    setIsEditing(false);
    toast('Test updated successfully.', 'success');
  };

  const handleDelete = async () => {
    setDeleting(true);
    const response = await api.delete<{ success: boolean }>(`/api/tests/${params.id}`);
    if (!response || response.error) {
      setDeleting(false);
      setError(response?.error || 'Failed to delete test.');
      return;
    }
    toast('Test deleted.', 'success');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold">Test Details</h1>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-error bg-red-50 p-4 text-sm text-error">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold">Test Details</h1>
              <p className="text-sm text-secondary">ID: {test?.id}</p>
            </div>
            {test?.status && (
              <Badge variant={statusBadge[test.status].variant}>{statusBadge[test.status].label}</Badge>
            )}
          </div>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-error bg-red-50 p-3 text-sm text-error">
                {error}
              </div>
            )}
            <Input
              label="Title"
              value={title}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
              disabled={!isEditing}
            />
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
                disabled={!isEditing}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                rows={4}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className="block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => setStatus(event.target.value as TestStatus)}
                disabled={!isEditing}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="grid gap-2 text-sm text-secondary md:grid-cols-2">
              <p>Created: {test?.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p>Updated: {test?.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="destructive" onClick={() => setShowDelete(true)}>
              Delete
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              {isEditing ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={saving}>Save changes</Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Test
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Test?">
        <p className="text-sm text-secondary">
          This action cannot be undone. Are you sure you want to delete this test?
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="destructive" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
