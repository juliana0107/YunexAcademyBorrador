import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { requestStreamTicket, buildStreamUrl, recordScreenshotAttempt } from '../api/videos.api';
import { getVideoProgress, upsertVideoProgress } from '@/features/video-progress/api/video-progress.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

const TICKET_RENEW_INTERVAL_MS = 45_000;
const PROGRESS_REPORT_INTERVAL_MS = 5_000;

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

  // Guardar el último segundo visto para reportar
  const lastReportedSecondsRef = useRef<number>(-1);
  const initialSeekDoneRef = useRef<boolean>(false);

  // 1. Renovación de ticket
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

  // 2. Reset al cambiar de video
  useEffect(() => {
    lastReportedSecondsRef.current = -1;
    initialSeekDoneRef.current = false;
  }, [videoId]);

  // 3. Seek inicial al progreso previo
  useEffect(() => {
    if (!streamUrl || initialSeekDoneRef.current) return;

    const video = videoRef.current;
    if (!video) return;

    async function seekToPrevious(): Promise<void> {
      try {
        const progress = await getVideoProgress(videoId);
        if (progress && progress.watchedSeconds > 0 && !progress.completed) {
          // Solo saltar si NO está completado
          video!.currentTime = progress.watchedSeconds;
        }
        initialSeekDoneRef.current = true;
      } catch {
        initialSeekDoneRef.current = true;
      }
    }

    // Esperar a que el video cargue metadata
    if (video.readyState >= 1) {
      void seekToPrevious();
    } else {
      const onLoaded = (): void => {
        void seekToPrevious();
        video.removeEventListener('loadedmetadata', onLoaded);
      };
      video.addEventListener('loadedmetadata', onLoaded);
      return () => video.removeEventListener('loadedmetadata', onLoaded);
    }
  }, [streamUrl, videoId]);

  // 4. Reportar progreso cada 5 segundos
  useEffect(() => {
    const interval = window.setInterval(() => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused || video.ended) return;
      if (!video.duration || isNaN(video.duration)) return;

      const currentSec = Math.floor(video.currentTime);
      if (currentSec === lastReportedSecondsRef.current) return;

      lastReportedSecondsRef.current = currentSec;
      const totalSec = Math.floor(video.duration);

      void upsertVideoProgress(videoId, currentSec, totalSec).catch(() => {
        // silencioso
      });
    }, PROGRESS_REPORT_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [videoId]);

  // 5. Reportar al pausar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onPause(): void {
      if (!video!.duration || isNaN(video!.duration)) return;
      const currentSec = Math.floor(video!.currentTime);
      if (currentSec === 0) return; // no reportar si nunca empezó
      const totalSec = Math.floor(video!.duration);
      void upsertVideoProgress(videoId, currentSec, totalSec).catch(() => {
        // silencioso
      });
    }

    video.addEventListener('pause', onPause);
    return () => video.removeEventListener('pause', onPause);
  }, [videoId, streamUrl]);

  // 6. Detección de capturas
  useEffect(() => {
    function handleCapture(source: string): void {
      void recordScreenshotAttempt(videoId).catch(() => {
        /* silencioso */
      });

      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
      }

      setCaptureWarning(true);
      if (warningTimeoutRef.current !== null) {
        window.clearTimeout(warningTimeoutRef.current);
      }
      warningTimeoutRef.current = window.setTimeout(() => {
        setCaptureWarning(false);
      }, 4000);

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

      if (e.ctrlKey && key.toLowerCase() === 's') {
        e.preventDefault();
        handleCapture('Ctrl+S');
        return;
      }
    }

    function onVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
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

      {user && (
        <div
          className="absolute top-3 right-3 text-white/40 text-xs font-medium pointer-events-none select-none"
          style={{ textShadow: '0 0 4px rgba(0,0,0,0.5)' }}
        >
          {user.email}
        </div>
      )}

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