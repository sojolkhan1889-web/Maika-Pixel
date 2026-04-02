import React, { useEffect, useState } from 'react';
import { Activity, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-text-muted mt-1">Monitor all incoming events and CAPI processing status.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-text-muted">
              <tr>
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Event Name</th>
                <th className="p-4 font-medium">Pixel ID</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">Loading logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">No logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-text-muted whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-white">{log.event_name}</span>
                    </td>
                    <td className="p-4 font-mono text-xs text-text-muted">
                      {log.pixel_id}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold",
                        log.status === 'success' ? "bg-success/10 text-success" : 
                        log.status === 'failed' ? "bg-danger/10 text-danger" : 
                        "bg-warning/10 text-warning"
                      )}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs truncate text-xs text-text-muted font-mono bg-black/30 p-1.5 rounded">
                        {JSON.stringify(log.event_data)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
