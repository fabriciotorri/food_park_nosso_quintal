-- Food Park Nosso Quintal — estrutura inicial do banco


create extension if not exists "pgcrypto";

create type public.establishment_kind as enum ('food', 'bar');
create type public.order_status as enum ('draft', 'sent_to_whatsapp', 'accepted', 'preparing', 'ready', 'cancelled');

create table public.food_parks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.establishments (
  id uuid primary key default gen_random_uuid(),
  food_park_id uuid not null references public.food_parks(id) on delete cascade,
  name text not null,
  slug text not null,
  kind public.establishment_kind not null,
  whatsapp_number text not null,
  description text,
  logo_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (food_park_id, slug)
);

create table public.dining_tables (
  id uuid primary key default gen_random_uuid(),
  food_park_id uuid not null references public.food_parks(id) on delete cascade,
  number integer not null check (number > 0),
  public_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (food_park_id, number)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (establishment_id, name)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  base_price numeric(10,2) not null check (base_price >= 0),
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_option_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  min_choices integer not null default 0 check (min_choices >= 0),
  max_choices integer check (max_choices is null or max_choices >= min_choices),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  option_group_id uuid not null references public.product_option_groups(id) on delete cascade,
  name text not null,
  price_delta numeric(10,2) not null default 0,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  food_park_id uuid not null references public.food_parks(id),
  table_id uuid not null references public.dining_tables(id),
  public_code text not null unique default upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 8)),
  customer_name text,
  status public.order_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Um mesmo pedido pode conter itens de diversas operações.
create table public.order_groups (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id),
  status public.order_status not null default 'draft',
  whatsapp_opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, establishment_id)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_group_id uuid not null references public.order_groups(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  notes text,
  selected_options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index establishments_food_park_idx on public.establishments(food_park_id);
create index dining_tables_token_idx on public.dining_tables(public_token);
create index categories_establishment_idx on public.categories(establishment_id);
create index products_establishment_idx on public.products(establishment_id);
create index products_category_idx on public.products(category_id);
create index orders_table_created_idx on public.orders(table_id, created_at desc);
create index order_groups_order_idx on public.order_groups(order_id);
create index order_items_group_idx on public.order_items(order_group_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger food_parks_set_updated_at before update on public.food_parks for each row execute procedure public.set_updated_at();
create trigger establishments_set_updated_at before update on public.establishments for each row execute procedure public.set_updated_at();
create trigger dining_tables_set_updated_at before update on public.dining_tables for each row execute procedure public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger product_option_groups_set_updated_at before update on public.product_option_groups for each row execute procedure public.set_updated_at();
create trigger product_options_set_updated_at before update on public.product_options for each row execute procedure public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
create trigger order_groups_set_updated_at before update on public.order_groups for each row execute procedure public.set_updated_at();

-- Segurança: nenhuma tabela é exposta diretamente ao visitante.
-- O site consultará dados públicos via servidor e os pedidos serão gravados
-- por uma rota validada. Políticas de usuários administrativos virão depois.
alter table public.food_parks enable row level security;
alter table public.establishments enable row level security;
alter table public.dining_tables enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_option_groups enable row level security;
alter table public.product_options enable row level security;
alter table public.orders enable row level security;
alter table public.order_groups enable row level security;
alter table public.order_items enable row level security;
