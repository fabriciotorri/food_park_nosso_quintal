# Food Park MVP

Protótipo funcional de cardápio digital para uma mesa fictícia (Mesa 12). Ele demonstra a jornada principal: selecionar itens em estabelecimentos diferentes, visualizar o carrinho separado por loja e abrir o WhatsApp com uma mensagem pronta para cada operação.

## Como executar

1. Instale o Node.js 20 ou superior.
2. No terminal, abra esta pasta e rode `npm install`.
3. Rode `npm run dev`.
4. Acesse `http://localhost:3000`.

> Os números de WhatsApp em `app/ui/menu-data.ts` são apenas exemplos. Troque-os pelos números reais, sempre com `55 + DDD + número`.

## QR Codes e mesas

O primeiro QR Code de teste deve apontar para `http://localhost:3000/m/mesa-12-demo`. Para produção ele será, por exemplo, `https://menu.seufoodpark.com/m/mesa-12-demo`.

Por enquanto as mesas são cadastradas em `app/ui/menu-data.ts`, na lista `foodParkTables`. O próximo passo será mover essa lista para o banco de dados, para gerar e desativar QR Codes pelo painel administrativo.

## Supabase

1. No Supabase, abra **SQL Editor** > **New query**.
2. Abra `supabase/migrations/20260803_initial_schema.sql` neste projeto, copie todo o conteúdo e cole no editor.
3. Clique em **Run**. Isso cria as tabelas do MVP e ativa a segurança por linha (RLS).
4. Em **Project Settings** > **API**, copie a Project URL e a Publishable key. Copie `.env.example` para `.env.local` e preencha apenas essas duas variáveis por enquanto.

Depois, execute também `supabase/migrations/20260803_public_menu_read_policies.sql` no SQL Editor. Ele libera somente a leitura dos cardápios ativos para os visitantes; pedidos continuam bloqueados para acesso público.

Por fim, execute `supabase/migrations/20260803_grant_public_menu_access.sql`. Como a opção de não expor novas tabelas foi selecionada na criação do projeto, esta migração concede a permissão SQL de leitura que complementa as políticas RLS.

Não compartilhe a senha do banco nem a chave `service_role`; `.env.local` já está ignorado pelo Git.

Depois de preencher `.env.local`, reinicie `npm run dev` e abra `http://localhost:3000/api/database-status`. A resposta `{ "connected": true }` confirma que o projeto consegue falar com o banco sem expor dados ou credenciais.

## Plano de telas e funcionalidades

### Fase 1 — MVP (o que este protótipo representa)

| Tela | Objetivo | Funcionalidades |
|---|---|---|
| Link/QR da mesa | Identificar a mesa | URL como `/m/12`; QR único por mesa |
| Home do food park | Escolher operação | Lista de restaurantes e bares ativos |
| Cardápio | Escolher produtos | Categorias, produtos, preços, disponibilidade e adicionais |
| Carrinho | Consolidar pedido | Itens de diversas lojas, total geral e totais por loja |
| Finalização | Enviar pedidos | Nome opcional, gravação do pedido e botão WhatsApp separado por operação |
| Painel administrador | Manter a operação | Cadastro de lojas, mesas, cardápios, preços, fotos e WhatsApp |

Critérios de aceite: o QR abre a mesa correta; item indisponível não pode ser comprado; cada estabelecimento recebe somente os seus itens; os preços do pedido ficam congelados no momento da finalização; nenhum pagamento é processado pelo sistema.

### Fase 2 — operação diária

| Tela | Funcionalidades |
|---|---|
| Login da loja | Usuário por estabelecimento e permissões |
| Pedidos da loja | Filtro por data/status, mesa, itens, horário e impressão |
| Disponibilidade | Ativar/desativar item imediatamente |
| QR Codes | Gerar, baixar e imprimir QR por mesa |
| Relatórios | Pedidos por loja, mesa e período; sem tratar faturamento como pagamento oficial |

### Fase 3 — evolução

| Recurso | Decisão necessária |
|---|---|
| Status do pedido | Quem atualiza: atendente, cozinha ou caixa? |
| Aviso ao cliente | Coletar telefone e usar API oficial do WhatsApp |
| Pedido na mesa | Regras de entrega, senha/identificação e chamada de garçom |
| Pagamento | Integrar por loja ou manter totalmente fora do sistema |
| Integração WhatsApp API | Conta Meta e número comercial de cada operação; custo por mensagem/plataforma |

## Próximas implementações técnicas

1. Criar projeto Supabase e tabelas: `establishments`, `tables`, `categories`, `products`, `orders` e `order_items`.
2. Trocar os dados demonstrativos por consulta ao banco.
3. Criar a rota dinâmica `/m/[tableToken]`, validando mesa e food park.
4. Criar o endpoint de finalização que grava o pedido antes de abrir o WhatsApp.
5. Adicionar autenticação e painel administrativo.
6. Hospedar em Vercel e configurar domínio próprio.

## Limitação intencional do MVP

O navegador não envia mensagens por WhatsApp sozinho. Ele abre a conversa com o texto pronto e o cliente confirma o envio. Para disparo automático e status, será necessária a API oficial WhatsApp Business em uma fase posterior.
