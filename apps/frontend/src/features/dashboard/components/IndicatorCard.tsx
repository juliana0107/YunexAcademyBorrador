import type { LucideIcon } from 'lucide-react';
import { NoDataState } from './NoDataState';
import { AlertTriangle } from 'lucide-react';

interface Props {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  isLoading?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function IndicatorCard({
  title,
  icon: Icon,
  iconColor = 'text-brand-600',
  iconBg = 'bg-brand-50',
  isLoading,
  error,
  children,
  className = '',
}: Props) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-3">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}