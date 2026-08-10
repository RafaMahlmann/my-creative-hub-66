import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Link2, Loader2, Trash2, Download, UploadCloud, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PendingSetupCard } from '@/components/course/PendingSetupCard';
import { useColumnSupport } from '@/hooks/useColumnSupport';
import { useLessonMaterials, useLessonMaterialMutations, type LessonMaterial } from '@/hooks/useLessonMaterials';
import { MATERIALS_ACCEPT, MATERIALS_MAX_BYTES, MATERIALS_MIGRATION_SQL, formatBytes, signedMaterialUrl } from '@/lib/materials';

type Props = { lessonId: string };

/** Uma linha da lista — recebe as ações já ligadas ao lessonId do pai. */
const MaterialRowInner = ({
  material,
  onRename,
  onRemove,
}: {
  material: LessonMaterial;
  onRename: (title: string) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation();
  const [baixando, setBaixando] = useState(false);

  const abrir = async () => {
    if (material.file_url) {
      window.open(material.file_url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!material.storage_path) return;
    setBaixando(true);
    try {
      const url = await signedMaterialUrl(material.storage_path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'erro');
    } finally {
      setBaixando(false);
    }
  };

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border border-course-border bg-course-card px-4 py-3">
      <FileText className="h-4 w-4 shrink-0 text-course-muted-foreground" />
      <Input
        defaultValue={material.title_pt}
        onBlur={(e) => e.target.value.trim() && e.target.value !== material.title_pt && onRename(e.target.value.trim())}
        className="min-w-[10rem] flex-1 border-transparent bg-transparent px-0 font-body text-sm text-course-foreground focus-visible:border-course-border focus-visible:px-3"
      />
      {material.file_type && (
        <span className="font-body text-xs uppercase text-course-muted-foreground">{material.file_type}</span>
      )}
      {formatBytes(material.size_bytes) && (
        <span className="font-body text-xs text-course-muted-foreground">{formatBytes(material.size_bytes)}</span>
      )}
      {!material.storage_path && material.file_url && (
        <span className="flex items-center gap-1 rounded-full bg-course-accent px-2 py-0.5 font-body text-[11px] text-course-accent-foreground">
          <Link2 className="h-3 w-3" /> {t('materials.external')}
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={baixando}
        onClick={abrir}
        title={t('materials.download')}
        aria-label={t('materials.download')}
        className="text-course-muted-foreground hover:text-course-foreground"
      >
        {baixando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm(t('materials.confirmDelete'))) onRemove();
        }}
        title={t('materials.remove')}
        aria-label={t('materials.remove')}
        className="text-course-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </li>
  );
};

/**
 * Material de apoio da aula: arrastar o arquivo é o caminho principal
 * (colar link continua existindo para um recurso externo legítimo, mas em
 * segundo plano — não é mais o único jeito de anexar algo).
 */
export const MaterialsTab = ({ lessonId }: Props) => {
  const { t } = useTranslation();
  const ok = useColumnSupport('lesson_materials', 'storage_path');
  const { data: materials, isLoading } = useLessonMaterials(lessonId);
  const { uploadFile, addLink, rename, remove } = useLessonMaterialMutations(lessonId);

  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [linkAberto, setLinkAberto] = useState(false);
  const [link, setLink] = useState({ title: '', url: '' });

  const enviar = (file: File) => {
    if (file.size > MATERIALS_MAX_BYTES) return toast.error(t('materials.tooLarge'));
    uploadFile.mutate(file);
  };

  return (
    <div className="space-y-4">
      <PendingSetupCard
        table="lesson_materials"
        column="storage_path"
        sql={MATERIALS_MIGRATION_SQL}
        titleKey="setup.materialsTitle"
        bodyKey="setup.materialsBody"
      />

      <ul className="space-y-2">
        {isLoading && <li className="font-body text-sm text-course-muted-foreground">{t('materials.loading')}</li>}
        {!isLoading && !materials?.length && (
          <li className="font-body text-sm text-course-muted-foreground">{t('lesson.noMaterials')}</li>
        )}
        {materials?.map((m) => (
          <MaterialRowInner
            key={m.id}
            material={m}
            onRename={(title) => rename.mutate({ id: m.id, title })}
            onRemove={() => remove.mutate(m)}
          />
        ))}
      </ul>

      <div
        onClick={() => ok && !uploadFile.isPending && inputRef.current?.click()}
        onDragOver={(e) => {
          if (!ok) return;
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          if (!ok) return;
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) enviar(f);
        }}
        role="button"
        tabIndex={ok ? 0 : -1}
        aria-label={t('materials.dropzone')}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center transition-colors ${
          !ok ? 'cursor-not-allowed opacity-60' : ''
        } ${drag ? 'border-course-primary bg-course-primary/5' : 'border-course-border'}`}
      >
        {uploadFile.isPending ? (
          <Loader2 className="h-6 w-6 animate-spin text-course-primary" />
        ) : (
          <UploadCloud className="h-6 w-6 text-course-muted-foreground" />
        )}
        <p className="font-body text-sm text-course-foreground">{t('materials.dropzone')}</p>
        <p className="font-body text-xs text-course-muted-foreground">{t('materials.limits')}</p>
        <input
          ref={inputRef}
          type="file"
          accept={MATERIALS_ACCEPT}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) enviar(f);
            e.target.value = '';
          }}
        />
      </div>

      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setLinkAberto((v) => !v)}
          className="text-course-muted-foreground hover:text-course-foreground"
        >
          <Link2 className="mr-2 h-3.5 w-3.5" /> {t('materials.pasteLink')}
        </Button>

        {linkAberto && (
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              value={link.title}
              onChange={(e) => setLink((s) => ({ ...s, title: e.target.value }))}
              placeholder={t('admin.materialTitle')}
              className="border-course-border bg-course-background text-course-foreground"
            />
            <Input
              value={link.url}
              onChange={(e) => setLink((s) => ({ ...s, url: e.target.value }))}
              placeholder="https://..."
              className="border-course-border bg-course-background text-course-foreground"
            />
            <Button
              type="button"
              disabled={addLink.isPending}
              onClick={() => {
                if (!link.title.trim() || !link.url.trim()) return;
                addLink.mutate(
                  { title: link.title.trim(), url: link.url.trim() },
                  { onSuccess: () => setLink({ title: '', url: '' }) },
                );
              }}
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> {t('admin.addMaterial')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
