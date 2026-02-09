
# Plano: Editor de Recorte de Foto (estilo WhatsApp)

## O que vai mudar

Quando voce estiver no modo de edicao e clicar na foto de perfil, em vez de simplesmente enviar a imagem direto, vai abrir uma tela de ajuste onde voce pode:

- Ampliar e reduzir a imagem (pinch/zoom no iPad, scroll no desktop)
- Arrastar a imagem para enquadrar o rosto
- Ver a previa do corte circular em tempo real
- Confirmar ou cancelar

## Como funciona

1. Voce clica na foto de perfil (no modo edicao)
2. Seleciona uma imagem do dispositivo
3. Abre um modal com a imagem e uma mascara circular
4. Voce ajusta o zoom e a posicao
5. Clica em "Confirmar" -- a imagem e cortada e enviada ao servidor
6. A foto fica salva permanentemente

## Detalhes tecnicos

### Novo componente: `ImageCropDialog.tsx`
- Modal usando Radix Dialog (ja instalado no projeto)
- Canvas HTML5 para renderizar a imagem e fazer o recorte
- Controle de zoom via slider (Radix Slider, ja instalado) e gesto de pinch no touch
- Arrastar a imagem com drag (mouse e touch)
- Mascara escura com recorte circular para visualizacao
- Botoes "Cancelar" e "Confirmar"

### Alteracao no `HeroSection.tsx`
- Ao selecionar arquivo, em vez de fazer upload direto, abre o `ImageCropDialog`
- Apos confirmar o recorte, faz o upload da imagem cortada para o bucket `hero-assets`
- O fluxo do background permanece como esta (upload direto, sem crop)

### Sem dependencias externas
- Implementacao 100% com Canvas API nativa + componentes ja existentes no projeto (Dialog, Slider)
- Funciona no iPad, iPhone e desktop sem bibliotecas adicionais
