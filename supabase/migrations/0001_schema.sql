-- Mega Descontos Serra: esquema inicial
-- Perfis: admin (donos), partner (empresa), customer (cliente)

create extension if not exists pgcrypto;

-- ---------- tabelas ----------
create table public.admin_emails (
  email text primary key
);

create table public.settings (
  key text primary key,
  value text not null
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('admin','partner','customer')),
  created_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  slug text not null unique,
  name text not null,
  category text not null check (category in ('Restaurantes','Cafés e doces','Pousadas e hotéis','Vinícolas','Passeios','Bem-estar','Entretenimento')),
  city text not null,
  description text,
  discount_pct int not null check (discount_pct between 10 and 30),
  rules text,
  cover_url text,
  cnpj text,
  whatsapp text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index partners_status_idx on public.partners(status, category);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','canceled','expired')),
  starts_at timestamptz,
  ends_at timestamptz,
  amount numeric(10,2) not null default 0,
  provider text not null default 'simulado',
  provider_ref text,
  created_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions(user_id, status, ends_at);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  discount_pct int not null,
  bill_amount numeric(10,2),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  validated_at timestamptz,
  validated_by uuid references public.profiles(id)
);
create index coupons_user_idx on public.coupons(user_id, created_at desc);
create index coupons_partner_idx on public.coupons(partner_id, created_at desc);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sponsor_name text not null,
  partner_id uuid references public.partners(id) on delete set null,
  position text not null check (position in ('home','categoria','blog')),
  color text not null default '#C8101A',
  link_url text,
  image_url text,
  starts_on date not null default current_date,
  ends_on date not null,
  status text not null default 'ativo' check (status in ('ativo','pausado')),
  price_month numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.banner_requests (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  title text not null,
  position text not null check (position in ('home','categoria','blog')),
  months int not null check (months between 1 and 12),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'Notícias',
  excerpt text not null default '',
  body text not null default '',
  cover_url text,
  ticket_label text,
  ticket_price numeric(10,2),
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_pub_idx on public.posts(published, published_at desc);

-- ---------- funções auxiliares ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.owns_partner(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.partners where id = p and owner_id = auth.uid());
$$;

create or replace function public.has_active_subscription(u uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.subscriptions
    where user_id = u and status = 'active' and now() between starts_at and ends_at);
$$;

-- perfil criado no cadastro; e-mails da lista viram admin
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''),
          case when exists(select 1 from public.admin_emails where lower(email) = lower(new.email)) then 'admin' else 'customer' end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- impede que usuários comuns mudem o próprio papel
create or replace function public.guard_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() and auth.uid() is not null then
    raise exception 'Somente administradores podem mudar o perfil.';
  end if;
  return new;
end $$;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- empresa não aprova a si mesma
create or replace function public.guard_partner_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and not public.is_admin() then
    new.status := 'pending';
    new.owner_id := auth.uid();
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status and not public.is_admin() and auth.uid() is not null then
    raise exception 'Somente administradores aprovam empresas.';
  end if;
  return new;
end $$;
create trigger partners_guard before insert or update on public.partners
  for each row execute function public.guard_partner_status();

-- aprovar empresa promove o dono a "partner"
create or replace function public.promote_partner_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and new.owner_id is not null then
    update public.profiles set role = 'partner' where id = new.owner_id and role = 'customer';
  end if;
  return new;
end $$;
create trigger partners_promote after insert or update of status on public.partners
  for each row execute function public.promote_partner_owner();

-- ---------- RPCs ----------
-- cliente resgata cupom (precisa de passaporte ativo)
create or replace function public.redeem_coupon(p_partner uuid, p_bill numeric default null)
returns public.coupons
language plpgsql security definer set search_path = public as $$
declare
  v_partner public.partners;
  v_coupon public.coupons;
  v_code text;
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_valid_minutes int := coalesce((select value::int from public.settings where key = 'coupon_minutes'), 15);
begin
  if auth.uid() is null then raise exception 'Entre na sua conta para resgatar.'; end if;
  if not public.has_active_subscription() then raise exception 'Você precisa de um passaporte ativo.'; end if;
  select * into v_partner from public.partners where id = p_partner and status = 'approved';
  if not found then raise exception 'Parceiro não encontrado.'; end if;

  -- reaproveita um cupom ainda válido e não usado
  select * into v_coupon from public.coupons
    where user_id = auth.uid() and partner_id = p_partner and validated_at is null and expires_at > now()
    order by created_at desc limit 1;
  if found then return v_coupon; end if;

  loop
    v_code := 'MDS-';
    for i in 1..6 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
      if i = 4 then v_code := v_code || '-'; end if;
    end loop;
    exit when not exists(select 1 from public.coupons where code = v_code);
  end loop;

  insert into public.coupons(code, user_id, partner_id, discount_pct, bill_amount, expires_at)
  values (v_code, auth.uid(), p_partner, v_partner.discount_pct, p_bill, now() + make_interval(mins => v_valid_minutes))
  returning * into v_coupon;
  return v_coupon;
end $$;

-- empresa valida o cupom no caixa
create or replace function public.validate_coupon(p_code text)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v public.coupons;
  v_name text;
begin
  select * into v from public.coupons where code = upper(trim(p_code));
  if not found then return json_build_object('ok', false, 'reason', 'nao_encontrado'); end if;
  if not (public.owns_partner(v.partner_id) or public.is_admin()) then
    return json_build_object('ok', false, 'reason', 'outro_parceiro');
  end if;
  if v.validated_at is not null then return json_build_object('ok', false, 'reason', 'ja_usado', 'validated_at', v.validated_at); end if;
  if v.expires_at < now() then return json_build_object('ok', false, 'reason', 'expirado'); end if;
  update public.coupons set validated_at = now(), validated_by = auth.uid() where id = v.id;
  select coalesce(nullif(full_name,''), split_part(email,'@',1)) into v_name from public.profiles where id = v.user_id;
  return json_build_object('ok', true, 'discount_pct', v.discount_pct, 'customer', v_name);
end $$;

-- passaporte simulado enquanto o pagamento não está integrado
create or replace function public.start_simulated_subscription()
returns public.subscriptions
language plpgsql security definer set search_path = public as $$
declare v public.subscriptions;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta primeiro.'; end if;
  if coalesce((select value from public.settings where key = 'payments_mode'), 'simulado') <> 'simulado' then
    raise exception 'Pagamento simulado desativado.';
  end if;
  if public.has_active_subscription() then
    select * into v from public.subscriptions where user_id = auth.uid() and status = 'active' order by ends_at desc limit 1;
    return v;
  end if;
  insert into public.subscriptions(user_id, status, starts_at, ends_at, amount, provider)
  values (auth.uid(), 'active', now(), now() + interval '1 year',
          coalesce((select value::numeric from public.settings where key = 'passport_price'), 199.90), 'simulado')
  returning * into v;
  return v;
end $$;

-- ---------- RLS ----------
alter table public.admin_emails enable row level security;
alter table public.settings enable row level security;
alter table public.profiles enable row level security;
alter table public.partners enable row level security;
alter table public.subscriptions enable row level security;
alter table public.coupons enable row level security;
alter table public.banners enable row level security;
alter table public.banner_requests enable row level security;
alter table public.posts enable row level security;

create policy "admin gerencia admin_emails" on public.admin_emails for all using (public.is_admin()) with check (public.is_admin());

create policy "todos leem configurações" on public.settings for select using (true);
create policy "admin altera configurações" on public.settings for all using (public.is_admin()) with check (public.is_admin());

create policy "ver o próprio perfil" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "editar o próprio perfil" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy "parceiros aprovados são públicos" on public.partners for select using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy "usuário cadastra empresa" on public.partners for insert to authenticated with check (true);
create policy "dono edita a empresa" on public.partners for update using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "admin exclui empresa" on public.partners for delete using (public.is_admin());

create policy "ver a própria assinatura" on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy "admin gerencia assinaturas" on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());

create policy "ver cupons" on public.coupons for select using (user_id = auth.uid() or public.owns_partner(partner_id) or public.is_admin());

create policy "banners ativos são públicos" on public.banners for select using ((status = 'ativo' and current_date between starts_on and ends_on) or public.is_admin());
create policy "admin gerencia banners" on public.banners for all using (public.is_admin()) with check (public.is_admin());

create policy "empresa vê os próprios pedidos" on public.banner_requests for select using (public.owns_partner(partner_id) or public.is_admin());
create policy "empresa pede banner" on public.banner_requests for insert to authenticated with check (public.owns_partner(partner_id) and status = 'pending');
create policy "admin decide pedidos" on public.banner_requests for update using (public.is_admin()) with check (public.is_admin());

create policy "posts publicados são públicos" on public.posts for select using (published or public.is_admin());
create policy "admin gerencia posts" on public.posts for all using (public.is_admin()) with check (public.is_admin());

-- funções expostas
revoke execute on function public.redeem_coupon(uuid, numeric) from anon, public;
revoke execute on function public.validate_coupon(text) from anon, public;
revoke execute on function public.start_simulated_subscription() from anon, public;
grant execute on function public.redeem_coupon(uuid, numeric) to authenticated;
grant execute on function public.validate_coupon(text) to authenticated;
grant execute on function public.start_simulated_subscription() to authenticated;

-- ---------- dados iniciais ----------
-- Os e-mails dos donos são cadastrados direto no banco (tabela admin_emails) e não ficam no código.
insert into public.settings(key, value) values ('payments_mode','simulado'), ('passport_price','199.90'), ('coupon_minutes','15'),
  ('price_home','490'), ('price_categoria','290'), ('price_blog','190');
