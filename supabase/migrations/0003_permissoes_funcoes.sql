-- Funções de gatilho não devem ser chamadas pela API
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.guard_profile_role() from anon, authenticated, public;
revoke execute on function public.guard_partner_status() from anon, authenticated, public;
revoke execute on function public.promote_partner_owner() from anon, authenticated, public;

-- has_active_subscription passa a olhar só o usuário logado
drop function public.has_active_subscription(uuid);
create function public.has_active_subscription() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.subscriptions
    where user_id = auth.uid() and status = 'active' and now() between starts_at and ends_at);
$$;
revoke execute on function public.has_active_subscription() from anon, public;
grant execute on function public.has_active_subscription() to authenticated;
