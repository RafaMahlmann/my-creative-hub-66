-- ═══════════════════════════════════════════════════════════════════════════
-- PROVISÓRIO — só para testar o player de verdade (retomar posição,
-- conclusão automática aos 90%, card de "a seguir" ao terminar o vídeo).
--
-- Troca o vídeo das 3 aulas de exemplo por filmes reais, curtos e de licença
-- Creative Commons (Blender Foundation — sem risco de direito autoral):
-- Big Buck Bunny, Sintel e Tears of Steel. IDs conferidos por busca, não
-- lembrados de cabeça.
--
-- Para reverter depois: troca o `ref` de volta pelo vídeo real da aula
-- (ou apaga o ref para voltar ao estado "vídeo ainda não disponível").
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE public.videos v SET provider = 'youtube', ref = 'YE7VzlLtp-4', duration_seconds = 596
FROM public.lessons l WHERE l.video_id = v.id AND l.slug = 'boas-vindas';

UPDATE public.videos v SET provider = 'youtube', ref = 'eRsGyueVLvQ', duration_seconds = 888
FROM public.lessons l WHERE l.video_id = v.id AND l.slug = 'componentes-basicos';

UPDATE public.videos v SET provider = 'youtube', ref = 'iD_MyDbP_ZE', duration_seconds = 734
FROM public.lessons l WHERE l.video_id = v.id AND l.slug = 'primeiro-dispositivo';
