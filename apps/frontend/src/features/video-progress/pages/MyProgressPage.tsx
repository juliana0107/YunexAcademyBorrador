import { CheckCircle2, Clock, PlayCircle, Video as VideoIcon, TrendingUp } from 'lucide-react';
import { useMyProgressOverview } from '../hooks/useVideoProgress';
import { useAuthStore } from '@/features/auth/store/auth.store';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function MyProgressPage() {
  const user = useAuthStore((s) => s.user);
  const { data: overview, isLoading } = useMyProgressOverview();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi progreso</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen de tu avance en {user?.firstName ? `${user.firstName}, ` : ''}la plataforma
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Cargando tu progreso...
        </div>
      ) : !overview ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          No se pudo cargar tu progreso
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={VideoIcon}
              label="Videos totales"
              value={overview.totalVideos}
              color="text-brand-600"
              bg="bg-brand-50"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completados"
              value={overview.completedVideos}
              color="text-green-600"
              bg="bg-green-50"
            />
            <StatCard
              icon={PlayCircle}
              label="En progreso"
              value={overview.inProgressVideos}
              color="text-amber-600"
              bg="bg-amber-50"
            />
            <StatCard
              icon={Clock}
              label="No iniciados"
              value={overview.notStartedVideos}
              color="text-gray-600"
              bg="bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Progreso promedio
                </h2>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-brand-700">
                  {overview.averageProgressPercent}%
                </span>
                <span className="text-sm text-gray-500 mb-1">
                  sobre los videos que empezaste
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{ width: `${overview.averageProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Tiempo total visto
                </h2>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-brand-700">
                  {formatDuration(overview.totalWatchTimeSeconds)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Suma de todos los segundos vistos en la plataforma
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: typeof VideoIcon;
  label: string;
  value: number;
  color: string;
  bg: string;
}

function StatCard({ icon: Icon, label, value, color, bg }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}