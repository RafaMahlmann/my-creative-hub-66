# Brief — Curso como página inicial e vídeo plug and play

## Objetivo

Fazer o site abrir diretamente na Área de Cursos e transformar “tenho um vídeo no computador e quero colocá-lo aqui” em um caminho visível, guiado e sem conceitos técnicos escondidos.

## Diagnóstico confirmado

- A rota `/` abre hoje o perfil do terapeuta; a vitrine de cursos está em `/curso`.
- No card de curso, **“Trocar vídeo” e “Editar textos” levam para a mesma página geral do curso**. Essa tela mostra módulos e aulas, mas nenhum campo de vídeo. Para chegar ao vídeo, ainda é preciso descobrir que se deve clicar no lápis de uma aula e abrir a aba Vídeo.
- No destaque, **“Editar destaque” permite escolher somente um vídeo já cadastrado**. Não existe ali uma porta clara para colocar um vídeo novo do computador ou da pasta do servidor.
- A ajuda atual explica a vitrine, mas não reage à ação escolhida no menu.
- A API do servidor local já devolve a raiz da biblioteca, porém a interface não mostra essa pasta nem permite trocá-la.
- O servidor e sua configuração pertencem ao projeto separado `plasma-servidor`; o código dele não deve entrar neste repositório.
- Hoje o servidor ajuda a localizar legendas e páginas. O vídeo da pasta ainda não pode ser selecionado e associado diretamente a uma aula ou ao destaque.

## Experiência proposta

### 1. Área de Cursos como página inicial

- `/` passa a renderizar a mesma vitrine que hoje aparece em `/curso`.
- `/curso` continua funcionando e aponta para a mesma vitrine, preservando links existentes.
- O perfil do terapeuta passa para `/terapeuta`.
- **“Site do terapeuta”** passa a apontar para `/terapeuta`.
- Revisar os links do perfil para não criar ciclos incorretos após a troca.

### 2. Menus orientados por tarefa

No destaque:

- **Colocar ou trocar vídeo**
- **Trocar capa**
- **Editar título e descrição**
- **Abrir curso completo**

Nos cards de curso:

- **Organizar módulos e aulas**
- **Escolher uma aula e colocar vídeo**
- **Trocar capa**
- **Editar título e descrição**

“Trocar vídeo” deixa de apontar silenciosamente para uma tela sem vídeo. Quando houver várias aulas, o sistema pergunta primeiro **em qual aula** o vídeo será colocado.

### 3. Assistente “Colocar vídeo”

Ao escolher a ação, abrir um assistente curto sobre a própria vitrine:

```text
Onde está seu vídeo?

[ Na pasta do servidor ]  recomendado agora
[ Neste computador ]      envio temporário
[ Vimeo ou YouTube ]      colar link
[ Já está na biblioteca ] escolher existente
```

#### Pasta do servidor

1. Mostrar se o servidor está ligado ou desligado.
2. Mostrar a pasta ativa, por exemplo `C:\Flor de Plasma\midia`.
3. Se estiver desligado, ensinar como iniciar sem deixar o administrador num beco sem saída.
4. Se estiver ligado, listar os vídeos encontrados com miniatura, nome, duração e pasta.
5. Escolher o destino: destaque ou curso → módulo → aula.
6. Revisar e salvar.

#### Neste computador

- Reaproveitar o envio temporário já existente, mas trazê-lo para o assistente em vez de escondê-lo no editor da aula.
- Explicar que ele envia uma cópia e que a pasta do servidor é a opção indicada para o acervo principal.

#### Vimeo ou YouTube

- Campo único para colar o link.
- Detecção automática da origem.
- Pré-visualização antes de associar ao destaque ou à aula.

#### Biblioteca

- Seleção visual de um vídeo já cadastrado, sem novo envio.

### 4. Ajuda contextual na voz do aplicativo

A orientação abaixo da vitrine deixa de ser sempre igual e reage à última ação.

Exemplo após clicar em **Colocar ou trocar vídeo**:

> **Vamos colocar seu vídeo aqui.**
> Este bloco escolhe um vídeo da Biblioteca, mas até agora não explicava como o vídeo entrava nela. Escolha se o arquivo está na pasta do servidor, neste computador, no Vimeo/YouTube ou se já está cadastrado.

Depois de escolher “pasta do servidor”:

> **Primeiro, deixe a pasta visível para o site.**
> Seu arquivo não precisa subir para a internet agora. Coloque-o na pasta ativa, ligue o servidor e clique em “Procurar novidades”. Quando ele aparecer, escolha onde será usado.

Regras:

- Ajuda ligada por padrão, com **Ocultar ajuda** sempre disponível.
- Português e inglês na mesma entrega.
- A ajuda nunca substitui a ação: cada orientação termina com o botão correto ao lado.
- Nenhuma mensagem manda “abrir o painel e procurar”; o botão leva ao ponto exato.

### 5. Central do servidor: pasta visível e fácil de trocar

Na Biblioteca de Vídeos, mostrar:

- **Servidor:** ligado/desligado.
- **Pasta em uso:** caminho completo atualmente lido.
- **Origem:** computador ou HD externo.
- **Vídeos encontrados:** quantidade.
- Botões **Procurar novidades** e **Trocar pasta**.
- Aviso claro quando a pasta deixou de existir porque o HD foi removido.

Fluxo desejado:

```text
Agora:  C:\Flor de Plasma\midia
Depois: E:\Flor de Plasma\midia

Trocar pasta → validar → salvar → varrer → mostrar vídeos
```

A troca não perde os vínculos. Os registros devem usar identificador estável e caminho relativo à raiz, nunca depender apenas de `C:` ou `E:`.

### 6. Parte pertencente ao servidor separado

Para **Trocar pasta** funcionar de verdade, o `plasma-servidor` precisará oferecer:

- leitura da raiz configurada;
- validação e salvamento local de uma nova pasta;
- nova varredura;
- IDs estáveis para reconhecer o mesmo vídeo após a mudança PC → HD;
- configuração acessível apenas pela máquina local, sem upload vindo da internet.

A pasta inicial pode ficar no computador. Depois, copia-se a estrutura para o HD, troca-se a raiz e faz-se uma nova varredura. O servidor continua somente leitura para os arquivos de mídia.

**Limite:** a primeira entrega neste projeto pode construir e simular toda a interface, mas a troca real da raiz depende de atualização coordenada no repositório do `plasma-servidor`.

## Sequência de implementação

### Etapa A — Corrigir a confusão imediata

- Tornar a Área de Cursos a página inicial e mover o perfil para `/terapeuta`.
- Renomear e corrigir os atalhos dos três pontos.
- Criar o seletor de aula quando a ação envolver vídeo de um curso.
- Fazer a ajuda da vitrine reagir à ação escolhida.

**Pronto quando:** clicar em “colocar vídeo” nunca termina numa tela sem vídeo e sem explicação.

### Etapa B — Assistente unificado

- Implementar as quatro origens: servidor, computador, link e biblioteca.
- Reaproveitar upload, biblioteca e seletor já existentes.
- Associar diretamente ao destaque ou a uma aula.
- Criar textos PT/EN na voz do aplicativo.

**Pronto quando:** o administrador começa na vitrine e termina vendo o vídeo no lugar escolhido.

### Etapa C — Interface da pasta do servidor

- Exibir a raiz já devolvida pela API.
- Criar estados ligado, desligado, pasta ausente, varrendo e novidades encontradas.
- Preparar **Trocar pasta** e sua simulação visual.

**Pronto quando:** sempre fica evidente qual pasta está sendo lida.

### Etapa D — Integração com `plasma-servidor`

- Implementar no servidor local a configuração segura da raiz e a varredura.
- Conectar os comandos da interface.
- Testar primeiro com pasta no computador e depois com a mesma estrutura no HD externo.

**Pronto quando:** mudar do computador para o HD exige apenas escolher a nova raiz e confirmar, sem recadastrar vídeos.

## Áreas envolvidas neste projeto

- Rotas e navegação do perfil/curso.
- Vitrine, menus dos cards e editor de destaque.
- Novo assistente, reaproveitando Biblioteca, upload e editores atuais.
- Biblioteca de Vídeos e cartão do servidor.
- Hook do servidor para consumir raiz, varredura e futura troca de pasta.
- Modo Simulação para testar sem depender do HD.
- Traduções PT/EN e testes dos fluxos principais.

## Limites

- Não colocar código do `plasma-servidor` neste repositório público.
- Não criar transcrição automática no site; as legendas continuam vindo do servidor local via Groq.
- Não alterar agora o modelo completo de múltiplas fontes/fallback; primeiro resolver a entrada e a associação do vídeo.
- Preservar e conferir as mudanças locais já existentes em `MaterialsTab` e `Simulacao` antes de qualquer implementação.