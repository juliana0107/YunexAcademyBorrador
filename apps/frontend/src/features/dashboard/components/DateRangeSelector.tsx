import type { DateRangePreset } from '../types/dashboard.types';

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'all-time', label: 'Todo el tiempo' },
  { value: 'last-7-days', label: 'Últimos 7 días' },
  { value: 'last-30-days', label: 'Últimos 30 días' },
  { value: 'last-90-days', label: 'Últimos 90 días' },
];

interface Props {
  value: DateRangePreset;
  onChange: (preset: DateRangePreset) => void;
}

export function DateRangeSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DateRangePreset)}
      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      {PRESETS.map((preset) => (
        <option key={preset.value} value={preset.value}>
          {preset.label}
        </option>
      ))}
    </select>
  );
}