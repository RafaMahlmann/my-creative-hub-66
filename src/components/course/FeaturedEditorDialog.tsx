import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ThumbPicker } from '@/components/course/ThumbPicker';
import { useAdminVideos } from '@/hooks/useAdminVideos';
import { useAdminCourses, useAdminMutations } from '@/hooks/useAdminCourses';
import { useHomeEditing } from '@/hooks/useHomeEditing';
import { pick } from '@/lib/course';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId?: string;
};

/** Editor do bloco "Em destaque": escolhe curso, vídeo, textos e capa. */
export const FeaturedEditorDialog = ({ open, onOpenChange, courseId }: Props) => {
  const { t } = useTranslation();
  const { data: courses } = useAdminCourses();
  const { data: videos } = useAdminVideos();
  const { updateCourse } = useAdminMutations();
  const { setFeaturedCourse } = useHomeEditing();

  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(courseId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const course = courses?.find((c) => c.id === selectedCourse);

  useEffect(() => {
    setSelectedCourse(courseId);
  }, [courseId]);

  useEffect(() => {
    if (!course) return;
    setTitle(course.title_pt ?? '');
    setDescription(course.description_pt ?? '');
    setCover(course.cover_url ?? '');
  }, [course?.id]);

  useEffect(() => {
    if (!open || !selectedCourse) return;
    // busca o trailer atual do curso escolhido
    const c = courses?.find((x) => x.id === selectedCourse) as { trailer_video_id?: string | null } | undefined;
    setVideoId(c?.trailer_video_id ?? null);
  }, [open, selectedCourse, courses]);

  const filteredVideos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (videos ?? []).filter((v) =>
      !q ? true : `${v.title_pt} ${v.title_en ?? ''} ${v.ref ?? ''}`.toLowerCase().includes(q),
    );
  }, [videos, query]);

  const save = async () => {
    if (!selectedCourse) return;
    await setFeaturedCourse.mutateAsync(selectedCourse);
    await updateCourse.mutateAsync({
      id: selectedCourse,
      title_pt: title,
      description_pt: description,
      cover_url: cover || null,
      trailer_video_id: videoId,
    } as never);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-course-border bg-course-card text-course-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t('editor.featuredTitle')}</DialogTitle>
          <DialogDescription className="font-body text-course-muted-foreground">
            {t('editor.featuredHelp')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-body text-sm">{t('editor.chooseCourse')}</Label>
            <div className="flex flex-wrap gap-2">
              {courses?.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCourse(c.id)}
                  className={`rounded-full border px-3 py-1.5 font-body text-sm transition-colors ${
                    selectedCourse === c.id
                      ? 'border-course-primary bg-course-primary/15 text-course-primary'
                      : 'border-course-border text-course-muted-foreground hover:text-course-foreground'
                  }`}
                >
                  {pick(c.title_pt, c.title_en)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-body text-sm">{t('editor.fieldTitle')}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="border-course-border bg-course-background" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-body text-sm">{t('editor.fieldCover')}</Label>
            <ThumbPicker url={cover || null} onChange={(u) => setCover(u ?? '')} />
          </div>

          <div className="space-y-1.5">
            <Label className="font-body text-sm">{t('editor.fieldSubtitle')}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-course-border bg-course-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">{t('editor.chooseVideo')}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-course-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('editor.searchVideo')}
                className="border-course-border bg-course-background pl-9"
              />
            </div>
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-course-border p-2">
              <button
                type="button"
                onClick={() => setVideoId(null)}
                className={`w-full rounded-lg px-3 py-2 text-left font-body text-sm ${
                  videoId === null ? 'bg-course-primary/15 text-course-primary' : 'hover:bg-course-secondary'
                }`}
              >
                {t('editor.noVideo')}
              </button>
              {filteredVideos.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVideoId(v.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left font-body text-sm ${
                    videoId === v.id ? 'bg-course-primary/15 text-course-primary' : 'hover:bg-course-secondary'
                  }`}
                >
                  <span className="block">{pick(v.title_pt, v.title_en)}</span>
                  <span className="block text-xs text-course-muted-foreground">
                    {v.provider} · {v.ref ?? v.storage_path ?? '—'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('editor.cancel')}
          </Button>
          <Button
            onClick={save}
            disabled={!selectedCourse || updateCourse.isPending || setFeaturedCourse.isPending}
            className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
          >
            {t('editor.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
