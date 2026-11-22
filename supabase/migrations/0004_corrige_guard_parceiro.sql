-- A trava de status só vale para usuários logados (não para scripts do banco).
create or replace function public.guard_partner_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.owner_id := auth.uid();
  elsif new.status is distinct from old.status then
    raise exception 'Somente administradores aprovam empresas.';
  end if;
  return new;
end $$;
revoke execute on function public.guard_partner_status() from anon, authenticated, public;

-- aprova os parceiros de exemplo criados pela migração 0002
update public.partners set status = 'approved' where owner_id is null and description like 'Exemplo:%';
