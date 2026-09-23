import { Video } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import type { VideoProgressValue } from '../../types/dashboard.types';

interface Props {
  value: VideoProgressValue | null;
  isLoading?: boolean;
  error?: string;
}

export function VideoProgressCard({ value, isLoading, error }: Props) {
  return (
    <IndicatorCard
      title="Progreso de videos"
      icon={Video}
      iconColor="text-pink-600"
      iconBg="bg-pink-50"
      isLoading={isLoading}
      error={error}
    >
      {!value || value.totalVideos === 0 ? (
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-gray-300">0</p>
          <p className="text-xs text-gray-500 mt-1">Sin videos</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {value.averageProgressPercent}%
            </span>
            <span className="text-xs text-gray-500">promedio</span>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
              style={{ width: `${value.averageProgressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <SmallStat label="Completados" value={value.completedVideos} />
            <SmallStat label="En progreso" value={value.inProgressVideos} />
            <SmallStat label="Sin empezar" value={value.notStartedVideos} />
          </div>
        </div>
      )}
    </IndicatorCard>
  );
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-base font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
    </div>
  );
}