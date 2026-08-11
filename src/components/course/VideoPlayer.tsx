import { useRef } from 'react';
import ReactPlayer from 'react-player';
import { useTranslation } from 'react-i18next';
import { Lock, PlayCircle } from 'lucide-react';
import type { VideoInfo } from '@/hooks/useLesson';

/** Abaixo disto não vale a pena pular — a pessoa nem notaria que "retomou". */
const MIN_RESUME_SECONDS = 5;

export function buildVideoSrc(video?: VideoInfo | null): string | null {
  if (!video || !video.ref) return null;
  const ref = video.ref.trim();
  const isUrl = /^https?:\/\//i.test(ref);
  switch (video.provider) {
    case 'vimeo':
      return isUrl ? ref : `https://vimeo.com/${ref}`;
    case 'youtube':
      return isUrl ? ref : `https://www.youtube.com/watch?v=${ref}`;
    default:
      return ref;
  }
}

type Props = {
  video?: VideoInfo | null;
  locked?: boolean;
  /** chamado a cada avanço real do tempo assistido, em segundos */
  onProgressSeconds?: (seconds: number) => void;
  /** segundo em que retomar, se a pessoa já tinha assistido parte desta aula */
  startAt?: number;
  onEnded?: () => void;
};

export const VideoPlayer = ({ video, locked, onProgressSeconds, startAt, onEnded }: Props) => {
  const { t } = useTranslation();
  const src = buildVideoSrc(video);
  const ref = useRef<HTMLVideoElement>(null);
  const resumedRef = useRef(false);

  if (locked) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-course-border bg-course-card text-course-muted-foreground">
        <Lock size={36} strokeWidth={1.2} />
        <p className="font-body text-sm">{t('lesson.locked')}</p>
      </div>
    );
  }

  if (!src) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-course-border bg-course-card text-course-muted-foreground">
        <PlayCircle size={40} strokeWidth={1.2} />
        <p className="font-body text-sm">{t('lesson.noVideo')}</p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-course-border bg-black">
      <ReactPlayer
        ref={ref}
        src={src}
        controls
        width="100%"
        height="100%"
        config={{ vimeo: { cc: true } }}
        onTimeUpdate={(e) => onProgressSeconds?.(e.currentTarget.currentTime)}
        onLoadedMetadata={() => {
          if (resumedRef.current || !startAt || startAt < MIN_RESUME_SECONDS) return;
          resumedRef.current = true;
          const duration = ref.current?.duration ?? Infinity;
          if (startAt < duration - MIN_RESUME_SECONDS && ref.current) {
            ref.current.currentTime = startAt;
          }
        }}
        onEnded={() => onEnded?.()}
      />
    </div>
  );
};
