import { Camera, AlertTriangle } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import type { ScreenshotAttemptsValue } from '../../types/dashboard.types';

interface Props {
  value: ScreenshotAttemptsValue | null;
  isLoading?: boolean;
  error?: string;
}

export function ScreenshotAttemptsCard({ value, isLoading, error }: Props) {
  const hasAttempts = value && value.totalAttempts > 0;

  return (
    <IndicatorCard
      title="Intentos de captura"
      icon={hasAttempts ? AlertTriangle : Camera}
      iconColor={hasAttempts ? 'text-red-600' : 'text-gray-500'}
      iconBg={hasAttempts ? 'bg-red-50' : 'bg-gray-100'}
      isLoading={isLoading}
      error={error}
    >
      {!value ? (
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-gray-300">—</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${
                hasAttempts ? 'text-red-600' : 'text-gray-400'
              }`}
            >
              {value.totalAttempts}
            </span>
            <span className="text-xs text-gray-500">
              intento{value.totalAttempts !== 1 ? 's' : ''}
            </span>
          </div>

          {hasAttempts ? (
            <div className="text-xs text-gray-600 space-y-1 pt-1">
              <p>
                👤 {value.uniqueUsers} usuario{value.uniqueUsers !== 1 ? 's' : ''}{' '}
                único{value.uniqueUsers !== 1 ? 's' : ''}
              </p>
              <p>
                🎬 {value.affectedVideos} video
                {value.affectedVideos !== 1 ? 's' : ''} afectado
                {value.affectedVideos !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <p className="text-xs text-green-600 font-medium pt-1">
              ✓ Sin capturas registradas
            </p>
          )}
        </div>
      )}
    </IndicatorCard>
  );
}