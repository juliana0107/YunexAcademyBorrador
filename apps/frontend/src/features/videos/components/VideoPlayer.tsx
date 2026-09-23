import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { requestStreamTicket, buildStreamUrl, recordScreenshotAttempt } from '../api/videos.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

const TICKET_RENEW_INTERVAL_MS = 45_000;

interface Props {
  videoId: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ videoId, autoPlay = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const user = useAuthStore((s) => s.user);

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captureWarning, setCaptureWarning] = useState(false);
  const warningTimeoutRef = useRef<number | null>(null);

  // Pedir y renovar ticket
  useEffect(() => {
    let cancelled = false;
    let intervalId: number | null = null;

    async function fetchTicket(): Promise<void> {
      try {
        const { ticket } = await requestStreamTicket(videoId);
        if (!cancelled) {
          setStreamUrl(buildStreamUrl(videoId, ticket));
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar el video. Intenta de nuevo.');
        }
      }
    }

    void fetchTicket();

    intervalId = window.setInterval(() => {
      void fetchTicket();
    }, TICKET_RENEW_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [videoId]);

  // Detección de capturas
  useEffect(() => {
    function handleCapture(source: string): void {
      // Registrar en backend
      void recordScreenshotAttempt(videoId).catch(() => {
        /* silencioso */
      });

      // Pausar el video
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
      }

      // Mostrar alerta por 4 segundos
      setCaptureWarning(true);
      if (warningTimeoutRef.current !== null) {
        window.clearTimeout(warningTimeoutRef.current);
      }
      warningTimeoutRef.current = window.setTimeout(() => {
        setCaptureWarning(false);
      }, 4000);

      // Para debugging: puedes loguear `source`
      console.warn(`[capture-protection] Triggered by: ${source}`);
    }

    function onKeyDown(e: KeyboardEvent): void {
      const key = e.key;

      if (key === 'PrintScreen') {
        handleCapture('PrintScreen');
        return;
      }

      if (e.ctrlKey && e.shiftKey && key.toLowerCase() === 's') {
        handleCapture('Ctrl+Shift+S');
        return;
      }

      if (e.metaKey && e.shiftKey && key.toLowerCase() === 's') {
        handleCapture('Meta+Shift+S');
        return;
      }

      // Win+Shift+S no se puede detectar directo en el navegador,
      // pero en Windows produce Meta+Shift+S en algunos casos.
      if (e.ctrlKey && key.toLowerCase() === 's') {
        e.preventDefault();
        handleCapture('Ctrl+S');
        return;
      }
    }

    function onVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
        // Ocultar la pestaña por más de 2 segundos puede ser captura
        // Usamos un flag y luego comprobamos al volver
        const hiddenAt = Date.now();
        const onVisible = (): void => {
          const hiddenFor = Date.now() - hiddenAt;
          if (document.visibilityState === 'visible' && hiddenFor > 2000) {
            handleCapture('LongVisibilityChange');
          }
          document.removeEventListener('visibilitychange', onVisible);
        };
        document.addEventListener('visibilitychange', onVisible);
      }
    }

    function onContextMenu(e: MouseEvent): void {
      const video = videoRef.current;
      if (video && e.target === video) {
        e.preventDefault();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('contextmenu', onContextMenu);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('contextmenu', onContextMenu);
    };
  }, [videoId]);

  return (
    <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white text-sm px-6 text-center">
          {error}
        </div>
      )}

      {!error && !streamUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-gray-400 text-sm">
          Cargando video...
        </div>
      )}

      {streamUrl && (
        <video
          ref={videoRef}
          src={streamUrl}
          controls
          autoPlay={autoPlay}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full"
          style={{ userSelect: 'none', pointerEvents: 'auto' }}
        />
      )}

      {/* Watermark con email */}
      {user && (
        <div
          className="absolute top-3 right-3 text-white/40 text-xs font-medium pointer-events-none select-none"
          style={{ textShadow: '0 0 4px rgba(0,0,0,0.5)' }}
        >
          {user.email}
        </div>
      )}

      {/* Alerta de captura */}
      {captureWarning && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/70 backdrop-blur-sm pointer-events-none">
          <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-2xl max-w-sm">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Captura detectada</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Este intento ha quedado registrado
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}