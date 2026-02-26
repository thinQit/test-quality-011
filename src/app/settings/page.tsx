'use client';

import { useEffect, useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  uptimeSeconds: number;
  db: 'ok' | 'unavailable';
}

export function Page() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true);
      setError(null);
      const res = await api.get<HealthResponse>('/api/health?detail=true');
      if (res.error) {
        setError(res.error);
        toast(res.error, 'error');
      } else {
        setHealth(res.data ?? null);
      }
      setLoading(false);
    };

    fetchHealth();
  }, [toast]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and view system status.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Profile</h2>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant={user.role === 'admin' ? 'success' : 'secondary'}>{user.role}</Badge>
              </div>
              <Button variant="outline" onClick={logout} aria-label="Log out">
                Log Out
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No user logged in.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">System Health</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="h-6 w-6" />
            </div>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-sm text-error">{error}</p>
              <Button onClick={() => window.location.reload()} aria-label="Retry">Retry</Button>
            </div>
          ) : health ? (
            <div className="grid gap-4 md:grid-cols-3">
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
