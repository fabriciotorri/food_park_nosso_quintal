-- Permissões SQL necessárias além das políticas RLS.

grant usage on schema public to anon, authenticated;

grant select on table public.food_parks to anon, authenticated;
grant select on table public.establishments to anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.product_option_groups to anon, authenticated;
grant select on table public.product_options to anon, authenticated;
