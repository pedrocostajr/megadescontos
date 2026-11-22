-- Dados de exemplo para começar. Apague ou edite pelo painel dos donos.
insert into public.partners(slug, name, category, city, description, discount_pct, rules, status) values
('cantina-nonna-lucia','Cantina Nonna Lúcia','Restaurantes','Gramado','Exemplo: cantina italiana com massas artesanais.',20,'Válido no almoço e jantar, exceto feriados','approved'),
('fondue-do-vale','Fondue do Vale','Restaurantes','Canela','Exemplo: rodízio de fondue de queijo, carnes e chocolate.',15,'Rodízio de fondue, de domingo a sexta','approved'),
('cafe-bruma','Café Bruma','Cafés e doces','Gramado','Exemplo: café colonial e tortas.',25,'Cafés coloniais e tortas, todos os dias','approved'),
('pousada-araucaria','Pousada Araucária','Pousadas e hotéis','Canela','Exemplo: pousada com café da manhã.',30,'Diárias de domingo a quinta','approved'),
('vinicola-pedra-alta','Vinícola Pedra Alta','Vinícolas','Bento Gonçalves','Exemplo: degustação e loja de vinhos.',15,'Degustação e loja de vinhos','approved'),
('trilha-canion-tour','Trilha & Cânion Tour','Passeios','Cambará do Sul','Exemplo: passeios guiados aos cânions.',20,'Passeios guiados em grupo','approved'),
('spa-nevoa','Spa Névoa','Bem-estar','Gramado','Exemplo: massagens e day spa.',25,'Massagens e day spa, de segunda a sexta','approved'),
('churrascaria-galpao-crioulo','Churrascaria Galpão Crioulo','Restaurantes','Nova Petrópolis','Exemplo: espeto corrido.',20,'Espeto corrido, todos os dias','approved');

insert into public.banners(title, sponsor_name, partner_id, position, color, ends_on, price_month)
select 'Rodízio de fondue com 15% OFF todas as noites','Fondue do Vale', id, 'home', '#C8101A', current_date + 30, 490 from public.partners where slug='fondue-do-vale';
insert into public.banners(title, sponsor_name, partner_id, position, color, ends_on, price_month)
select 'Day spa na serra: 25% para quem tem passaporte','Spa Névoa', id, 'blog', '#00A6ED', current_date + 60, 190 from public.partners where slug='spa-nevoa';
insert into public.banners(title, sponsor_name, partner_id, position, color, ends_on, price_month)
select 'Diárias de domingo a quinta com 30% OFF','Pousada Araucária', id, 'categoria', '#2E9F18', current_date + 45, 290 from public.partners where slug='pousada-araucaria';

insert into public.posts(slug, title, category, excerpt, body, ticket_label, ticket_price, published, published_at) values
('roteiro-3-dias-gramado-canela','Roteiro de 3 dias em Gramado e Canela gastando menos','Roteiros',
 'Um roteiro de três dias pela serra com cafés, passeios e jantares, mostrando onde usar o passaporte para economizar em cada parada.',
 E'Três dias são suficientes para conhecer o essencial de Gramado e Canela sem correria. A ideia deste roteiro é alternar passeios ao ar livre com boas refeições, e usar o passaporte em cada parada.\n\n## Dia 1: centro de Gramado\n\nComece pelo centro a pé e almoce em um restaurante parceiro. À noite, um fondue fecha o dia.\n\n## Dia 2: Canela\n\nVá até a Catedral de Pedra e reserve a tarde para um café colonial.\n\n## Dia 3: natureza\n\nReserve a manhã para um passeio guiado e volte para um último almoço.\n\nComo o desconto do passaporte vale em toda visita, você pode voltar ao restaurante que mais gostou sem perder a economia.',
 'Passeio guiado pela serra', 120, true, now() - interval '2 days'),
('onde-comer-fondue-serra-gaucha','Onde comer fondue na Serra Gaúcha: guia do assinante','Gastronomia',
 'Rodízios, fondue de queijo e chocolate: como escolher a casa certa e quanto economizar com o passaporte Mega Descontos Serra.',
 E'O fondue é um dos pratos mais procurados por quem visita a serra, principalmente nos meses frios. Os rodízios costumam incluir queijo, carnes e chocolate.\n\nAntes de ir, confira no site os dias em que o desconto vale. Algumas casas aplicam o desconto só de domingo a sexta.\n\nCom 15% a 20% de desconto em cada visita, um casal que janta fondue duas vezes na viagem já recupera boa parte do valor do passaporte.',
 null, null, true, now() - interval '6 days'),
('canions-cambara-do-sul-primeiro-passeio','Cânions de Cambará do Sul: dicas para o primeiro passeio','Passeios',
 'O que levar, melhor horário e como contratar um passeio guiado com desconto para conhecer os cânions.',
 E'Os cânions estão entre as paisagens mais impressionantes do sul do Brasil. Para a primeira visita, um passeio guiado ajuda a aproveitar melhor as trilhas.\n\nLeve agasalho mesmo no verão, calçado fechado e água. A neblina muda rápido, então saia cedo.\n\nOperadoras parceiras dão 20% de desconto em passeios em grupo para assinantes.',
 'Trilha guiada nos cânions', 180, true, now() - interval '15 days');
