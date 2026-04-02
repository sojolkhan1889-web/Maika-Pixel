import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Activity, Search, Filter, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function EventLogs() {
  const { eventLogs, pixels, clearEventLogs } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pixelFilter, setPixelFilter] = useState<string>('all');

  const filteredLogs = eventLogs.filter(log => {
    const matchesSearch = log.eventName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesPixel = pixelFilter === 'all' || log.pixelId === pixelFilter;
    
    return matchesSearch && matchesStatus && matchesPixel;
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'failed': return <XCircle className="w-4 h-4 text-danger" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success': return <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">Success</span>;
      case 'failed': return <span className="px-2 py-1 rounded-full bg-danger/10 text-danger text-xs font-medium border border-danger/20">Failed</span>;
      case 'pending': return <span className="px-2 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium border border-warning/20">Pending</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Event Logs
          </h1>
          <p className="text-text-muted mt-1">Live tracking of events sent from your website to Maika Pixel.</p>
        </div>
        <button 
          onClick={clearEventLogs}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-text border border-white/10 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Clear Logs
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by Event ID or Name..." 
            className="input-field pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative min-w-[150px]">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <select 
              className="input-field pl-9 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="relative min-w-[200px]">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <select 
              className="input-field pl-9 appearance-none"
              value={pixelFilter}
              onChange={(e) => setPixelFilter(e.target.value)}
            >
              <option value="all">All Pixels</option>
              {pixels.map(p => (
                <option key={p.id} value={p.pixelId}>{p.name} ({p.pixelId})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 text-sm font-semibold text-text-muted">Event ID</th>
                <th className="p-4 text-sm font-semibold text-text-muted">Event Name</th>
                <th className="p-4 text-sm font-semibold text-text-muted">Event Data</th>
                <th className="p-4 text-sm font-semibold text-text-muted">Date & Time</th>
                <th className="p-4 text-sm font-semibold text-text-muted">Send Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    No event logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                        {log.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{log.eventName}</span>
                      <div className="text-xs text-text-muted mt-1 font-mono">Pixel: {log.pixelId}</div>
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="bg-black/30 p-2 rounded border border-white/5 max-h-24 overflow-y-auto custom-scrollbar">
                        <pre className="text-[10px] font-mono text-green-400/80 whitespace-pre-wrap">
                          {JSON.stringify(log.eventData, null, 2)}
                        </pre>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{format(new Date(log.timestamp), 'MMM dd, yyyy')}</div>
                      <div className="text-xs text-text-muted mt-0.5">{format(new Date(log.timestamp), 'hh:mm:ss a')}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        {getStatusBadge(log.status)}
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
