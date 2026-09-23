import { AlertTriangle } from 'lucide-react';

interface Props {
  errors: string[];
  onDismiss?: () => void;
}

export function PartialErrorBanner({ errors, onDismiss }: Props) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900">
            Algunos indicadores no pudieron cargar
          </p>
          <ul className="mt-1 text-xs text-amber-700 list-disc list-inside">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-amber-600 hover:text-amber-800 text-xs font-medium"
          >
            Ocultar
          </button>
        )}
      </div>
    </div>
  );
}