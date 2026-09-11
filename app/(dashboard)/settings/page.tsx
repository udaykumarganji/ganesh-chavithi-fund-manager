'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Calendar, User, ScrollText } from 'lucide-react';
import { formatDate } from '@/lib/format';

export default function SettingsPage() {
  const { festivalSettings, updateFestivalSettings, auditLogs } = useData();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [festivalName, setFestivalName] = useState('Ganesh Chavithi 2026');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (festivalSettings) {
      setFestivalName(festivalSettings.festival_name);
      setFestivalStartDate(festivalSettings.start_date || '');
      setFestivalEndDate(festivalSettings.end_date || '');
    }
  }, [festivalSettings]);

  const setFestivalStartDate = (date: string) => setStartDate(date);
  const setFestivalEndDate = (date: string) => setEndDate(date);

  const handleSaveFestival = async () => {
    if (!festivalName.trim()) {
      toast({ title: 'Festival name cannot be empty.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const result = await updateFestivalSettings({
      festival_name: festivalName.trim(),
      start_date: startDate || null,
      end_date: endDate || null,
    });
    setSaving(false);
    if (result.error) {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Festival settings saved successfully.' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">⚙️ Settings</h1>
        <p className="text-sm text-muted-foreground">Festival information and account settings</p>
      </div>

      {/* Festival Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" /> 🙏 Ganesh Chavithi Fund Overview
          </CardTitle>
          <CardDescription>Configure your festival details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="festival_name">Festival Name</Label>
            <Input
              id="festival_name"
              value={festivalName}
              onChange={(e) => setFestivalName(e.target.value)}
              placeholder="e.g. Ganesh Chavithi 2026"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Festival Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setFestivalStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Festival End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setFestivalEndDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSaveFestival} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
            Save Festival Settings
          </Button>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" /> Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">{profile?.name || 'Admin'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{profile?.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm font-medium">
                {profile?.created_at ? formatDate(profile.created_at) : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ScrollText className="h-5 w-5" /> Audit Log
          </CardTitle>
          <CardDescription>Recent activity in your account</CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between rounded-lg border border-border/60 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{log.description}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {log.action} · {log.entity_type}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
