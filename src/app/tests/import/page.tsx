'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useToast } from '@/providers/ToastProvider';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

interface ImportResult {
  imported: number;
  errors: Array<{ row: number; message: string }>;
}

export default function ImportTestsPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError('Please select a CSV file to import.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('/api/tests/import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Import failed.' }));
        setError(data.error || 'Import failed.');
        setLoading(false);
        return;
      }

      const data = (await response.json()) as ImportResult;
      setResult(data);
      toast('Import completed.', 'success');
      setLoading(false);
    } catch (_error) {
      setError('Import failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Import Tests</h1>
          <p className="text-sm text-secondary">Upload a CSV file with title, description, and status columns.</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-error bg-red-50 p-3 text-sm text-error">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="csv" className="block text-sm font-medium text-foreground">
                CSV File
              </label>
              <input
                id="csv"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-secondary">
                <Spinner className="h-4 w-4" />
                Importing...
              </div>
            )}
            {result && (
              <div className="space-y-2 text-sm text-secondary">
                <p>Imported: <span className="font-medium text-foreground">{result.imported}</span></p>
                {result.errors.length > 0 && (
                  <div className="rounded-md border border-border bg-muted p-3">
                    <p className="font-medium text-foreground">Errors:</p>
                    <ul className="list-disc pl-5">
                      {result.errors.map(errorItem => (
                        <li key={`${errorItem.row}-${errorItem.message}`}>
                          Row {errorItem.row}: {errorItem.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="submit" loading={loading}>Import CSV</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
