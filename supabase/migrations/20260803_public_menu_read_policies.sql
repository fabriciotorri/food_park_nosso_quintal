-- Políticas de leitura pública do cardápio.
-- Não há políticas públicas para pedidos: eles serão gravados pelo servidor.

create policy "Public can read food parks"
on public.food_parks
for select
to anon, authenticated
using (true);

create policy "Public can read active establishments"
on public.establishments
for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

create policy "Public can read available products"
on public.products
for select
to anon, authenticated
using (is_available = true);

create policy "Public can read product option groups"
on public.product_option_groups
for select
to anon, authenticated
using (true);

create policy "Public can read available product options"
on public.product_options
for select
to anon, authenticated
using (is_available = true);
