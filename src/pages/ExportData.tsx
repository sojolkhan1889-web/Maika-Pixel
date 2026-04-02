import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Calendar, CheckCircle2, Database, ShoppingCart, Users, Activity, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type DataType = 'orders' | 'customers' | 'incompleteOrders' | 'eventLogs';
type DateRange = 'all' | '7days' | '30days';
type ExportFormat = 'csv' | 'json';

export function ExportData() {
  const store = useAppStore();
  const [dataType, setDataType] = useState<DataType>('orders');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const dataTypes = [
    { id: 'orders', name: 'Orders', icon: ShoppingCart, description: 'Complete order history and statuses' },
    { id: 'customers', name: 'Customers', icon: Users, description: 'Customer details and lifetime value' },
    { id: 'incompleteOrders', name: 'Incomplete Orders', icon: AlertCircle, description: 'Abandoned carts and recovery data' },
    { id: 'eventLogs', name: 'Event Logs', icon: Activity, description: 'Raw pixel tracking events and payloads' },
  ] as const;

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));

    // Add rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (typeof val === 'object' && val !== null) {
          // Stringify objects (like eventData) and escape quotes
          return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        }
        // Escape quotes in strings
        return `"${String(val !== undefined && val !== null ? val : '').replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  const filterByDate = (data: any[], dateField: string, range: DateRange) => {
    if (range === 'all') return data;
    const now = new Date().getTime();
    const days = range === '7days' ? 7 : 30;
    const ms = days * 24 * 60 * 60 * 1000;

    return data.filter(item => {
      const itemDate = new Date(item[dateField]).getTime();
      // Fallback if date parsing fails
      if (isNaN(itemDate)) return true; 
      return (now - itemDate) <= ms;
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);
    
    // Simulate slight delay for UX
    setTimeout(() => {
      let dataToExport: any[] = [];
      let dateField = 'date';

      switch (dataType) {
        case 'orders':
          dataToExport = store.orders;
          dateField = 'date';
          break;
        case 'customers':
          dataToExport = store.customers;
          dateField = 'joinDate';
          break;
        case 'incompleteOrders':
          dataToExport = store.incompleteOrders;
          dateField = 'date';
          break;
        case 'eventLogs':
          dataToExport = store.eventLogs;
          dateField = 'timestamp';
          break;
      }

      const filteredData = filterByDate(dataToExport, dateField, dateRange);

      if (filteredData.length === 0) {
        alert('No data found for the selected criteria.');
        setIsExporting(false);
        return;
      }

      let content = '';
      let mimeType = '';
      let extension = '';

      if (format === 'csv') {
        content = convertToCSV(filteredData);
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
      } else {
        content = JSON.stringify(filteredData, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        extension = 'json';
      }

      // Create Blob and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `maika_${dataType}_${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Database className="w-8 h-8 text-primary" />
          Export Data
        </h1>
        <p className="text-text-muted mt-1">Download your store's data for external analysis, backup, or reporting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Data Type Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">1. Select Data Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dataTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = dataType === type.id;
              
              return (
                <div 
                  key={type.id}
                  onClick={() => setDataType(type.id)}
                  className={cn(
                    "glass-card p-5 cursor-pointer transition-all border-2",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-transparent hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-text-muted"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className={cn("font-semibold", isSelected ? "text-white" : "text-text-muted")}>
                      {type.name}
                    </h3>
                  </div>
                  <p className="text-xs text-text-muted ml-11">
                    {type.description}
                  </p>
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Filters & Action */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6">
            
            <div>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                2. Date Range
              </h2>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-black/20 cursor-pointer hover:bg-white/5 transition-colors">
                  <input 
                    type="radio" 
                    name="dateRange" 
                    value="all" 
                    checked={dateRange === 'all'} 
                    onChange={(e) => setDateRange(e.target.value as DateRange)}
                    className="text-primary focus:ring-primary bg-black border-white/20"
                  />
                  <span className="text-sm font-medium">All Time</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-black/20 cursor-pointer hover:bg-white/5 transition-colors">
                  <input 
                    type="radio" 
                    name="dateRange" 
                    value="30days" 
                    checked={dateRange === '30days'} 
                    onChange={(e) => setDateRange(e.target.value as DateRange)}
                    className="text-primary focus:ring-primary bg-black border-white/20"
                  />
                  <span className="text-sm font-medium">Last 30 Days</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-black/20 cursor-pointer hover:bg-white/5 transition-colors">
                  <input 
                    type="radio" 
                    name="dateRange" 
                    value="7days" 
                    checked={dateRange === '7days'} 
                    onChange={(e) => setDateRange(e.target.value as DateRange)}
                    className="text-primary focus:ring-primary bg-black border-white/20"
                  />
                  <span className="text-sm font-medium">Last 7 Days</span>
                </label>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                3. Export Format
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat('csv')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all",
                    format === 'csv' 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-white/10 bg-black/20 text-text-muted hover:bg-white/5"
                  )}
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  <span className="text-xs font-semibold">CSV</span>
                </button>
                <button
                  onClick={() => setFormat('json')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all",
                    format === 'json' 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-white/10 bg-black/20 text-text-muted hover:bg-white/5"
                  )}
                >
                  <FileJson className="w-6 h-6" />
                  <span className="text-xs font-semibold">JSON</span>
                </button>
              </div>
            </div>

          </div>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full btn-primary py-4 text-base font-semibold flex items-center justify-center gap-2 relative overflow-hidden"
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating File...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Download Complete!
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download {format.toUpperCase()} File
              </>
            )}
            
            {exportSuccess && (
              <div className="absolute inset-0 bg-success/20 animate-pulse" />
            )}
          </button>
          
          <p className="text-xs text-center text-text-muted">
            Your data is securely generated locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
