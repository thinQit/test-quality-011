'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface TestItemPayload {
  name: string;
  description?: string;
  status?: 'draft' | 'active' | 'archived';
}

export function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload: TestItemPayload = { name, description, status };
    const res = await api.post<TestItemPayload>('/api/test-items', payload);

    if (res.error) {
      setError(res.error);
      toast(res.error, 'error');
      setLoading(false);
      return;
    }

    toast('Test Item created successfully', 'success');
    router.push('/test-items');
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Test Item</h1>
        <p className="text-muted-foreground">Add a new Test Item to the dashboard.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Test Item Details</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Name"
              name="name"
              placeholder="Enter name"
              value={name}
              onChange={event => setName(event.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Description</label>
              <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                className="min-h-[120px] w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add a description"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Status</label>
              <select
                value={status}
                onChange={event => setStatus(event.target.value as 'draft' | 'active' | 'archived')}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" loading={loading} aria-label="Create test item">
                Create
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} aria-label="Cancel">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
