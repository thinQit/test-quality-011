'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Test, TestStatus } from '@/types';
import { useToast } from '@/providers/ToastProvider';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function NewTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TestStatus>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    const response = await api.post<Test>('/api/tests', {
      title: title.trim(),
      description: description.trim() || undefined,
      status
    });

    if (!response || response.error) {
      setError(response?.error || 'Failed to create test.');
      setLoading(false);
      return;
    }

    const created = response.data;
    toast('Test created successfully.', 'success');
    setLoading(false);
    router.push(created?.id ? `/tests/${created.id}` : '/');
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Create Test</h1>
          <p className="text-sm text-secondary">Fill out the details to create a new test record.</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
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
              placeholder="Test title"
            />
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
                placeholder="Optional description"
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => router.push('/')}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Test</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
