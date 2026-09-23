import { RefreshCw } from 'lucide-react';
import { DateRangeSelector } from './DateRangeSelector';
import type { DateRangePreset } from '../types/dashboard.types';

interface Props {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DashboardFilters({
  preset,
  onPresetChange,
  onRefresh,
  isRefreshing,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <DateRangeSelector value={preset} onChange={onPresetChange} />

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Actualizar
      </button>
    </div>
  );
}