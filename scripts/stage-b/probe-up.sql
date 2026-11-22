begin;

-- Stage B probe-up must run as the migration/admin identity, never as a runtime role.
-- Trusted-owner rule: the migration/admin identity running this script (current_user)
-- must own the dhoip schema and both probe tables. Ownership is never transferred.
-- Known runtime roles are rejected below.
-- The runtime role is provisioned separately with no password in this file:
--   CREATE ROLE dhoip_app LOGIN NOINHERIT NOBYPASSRLS;
--   GRANT authenticated TO dhoip_app;
-- Set the role password through an approved secure administrative path.

do $$
begin
  if current_user in (
    'dhoip_app',
    'authenticated',
    'anon',
    'service_role',
    'authenticator'
  ) then
    raise exception 'Stage B probe-up must be run by the migration/admin identity, not a runtime role';
  end if;

  if not exists (select 1 from pg_roles where rolname = 'dhoip_app') then
    raise exception 'Role dhoip_app is not provisioned. Create it explicitly and grant authenticated before applying the probe.';
  end if;

  if exists (
    select 1
    from pg_roles
    where rolname = 'dhoip_app'
      and (not rolcanlogin or rolinherit or rolbypassrls or rolsuper)
  ) then
    raise exception 'Existing role dhoip_app is incompatible: require LOGIN, NOINHERIT, NOBYPASSRLS, and no superuser. No role attributes were changed.';
  end if;

  if not exists (
    select 1
    from pg_auth_members m
    join pg_roles granted_role on granted_role.oid = m.roleid
    join pg_roles member_role on member_role.oid = m.member
    where granted_role.rolname = 'authenticated'
      and member_role.rolname = 'dhoip_app'
  ) then
    raise exception 'dhoip_app is not a member of authenticated. Run: GRANT authenticated TO dhoip_app;';
  end if;
end
$$;

create schema if not exists dhoip;

do $$
declare
  schema_owner_name text;
  unrelated_relations integer;
begin
  select pg_get_userbyid(n.nspowner)
  into schema_owner_name
  from pg_namespace n
  where n.nspname = 'dhoip';

  if schema_owner_name is null then
    raise exception 'The dhoip schema was not found after creation';
  end if;

  if schema_owner_name <> current_user then
    raise exception 'Untrusted dhoip schema owner %. Expected migration/admin identity %. Ownership was not changed.', schema_owner_name, current_user;
  end if;

  if schema_owner_name in (
    'dhoip_app',
    'authenticated',
    'anon',
    'service_role',
    'authenticator'
  ) then
    raise exception 'The dhoip schema must not be owned by runtime role %', schema_owner_name;
  end if;

  select count(*) into unrelated_relations
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'dhoip'
    and c.relkind in ('r', 'p', 'v', 'm', 'f', 'S')
    and c.relname not in ('stage_b_employee_link', 'stage_b_probe_resource');

  if unrelated_relations > 0 then
    raise exception 'The dhoip schema contains unrelated relations. Refusing to apply the isolated Stage B probe.';
  end if;
end
$$;

do $$
declare
  incompatible_owner_name text;
begin
  select pg_get_userbyid(c.relowner)
  into incompatible_owner_name
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'dhoip'
    and c.relname in ('stage_b_employee_link', 'stage_b_probe_resource')
    and pg_get_userbyid(c.relowner) <> current_user
  limit 1;

  if incompatible_owner_name is not null then
    raise exception 'Existing probe table owned by %, not the migration/admin identity %. Ownership was not changed.', incompatible_owner_name, current_user;
  end if;
end
$$;

create table if not exists dhoip.stage_b_employee_link (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  employee_ref text not null,
  status text not null,
  constraint stage_b_employee_link_clerk_user_id_key unique (clerk_user_id),
  constraint stage_b_employee_link_status_check
    check (status in ('active', 'inactive', 'revoked'))
);

create table if not exists dhoip.stage_b_probe_resource (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  label text not null
);

do $$
declare
  link_column_count integer;
  link_matching_columns integer;
  resource_column_count integer;
  resource_matching_columns integer;
  status_constraint_def text;
  status_values text[];
begin
  select count(*) into link_column_count
  from information_schema.columns
  where table_schema = 'dhoip'
    and table_name = 'stage_b_employee_link';

  select count(*) into link_matching_columns
  from information_schema.columns
  where table_schema = 'dhoip'
    and table_name = 'stage_b_employee_link'
    and (
      (column_name = 'id' and udt_name = 'uuid' and is_nullable = 'NO')
      or (column_name = 'clerk_user_id' and udt_name = 'text' and is_nullable = 'NO')
      or (column_name = 'employee_ref' and udt_name = 'text' and is_nullable = 'NO')
      or (column_name = 'status' and udt_name = 'text' and is_nullable = 'NO')
    );

  select count(*) into resource_column_count
  from information_schema.columns
  where table_schema = 'dhoip'
    and table_name = 'stage_b_probe_resource';

  select count(*) into resource_matching_columns
  from information_schema.columns
  where table_schema = 'dhoip'
    and table_name = 'stage_b_probe_resource'
    and (
      (column_name = 'id' and udt_name = 'uuid' and is_nullable = 'NO')
      or (column_name = 'clerk_user_id' and udt_name = 'text' and is_nullable = 'NO')
      or (column_name = 'label' and udt_name = 'text' and is_nullable = 'NO')
    );

  if link_column_count <> 4 or link_matching_columns <> 4 then
    raise exception 'Existing dhoip.stage_b_employee_link has an incompatible column definition';
  end if;

  if resource_column_count <> 3 or resource_matching_columns <> 3 then
    raise exception 'Existing dhoip.stage_b_probe_resource has an incompatible column definition';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'dhoip.stage_b_employee_link'::regclass
      and contype = 'p'
      and (
        select array_agg(a.attname::text order by a.attnum)
        from unnest(conkey) as key(attnum)
        join pg_attribute a on a.attrelid = conrelid and a.attnum = key.attnum
      ) = ARRAY['id']
  ) then
    raise exception 'Existing dhoip.stage_b_employee_link has an incompatible primary key';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'dhoip.stage_b_probe_resource'::regclass
      and contype = 'p'
      and (
        select array_agg(a.attname::text order by a.attnum)
        from unnest(conkey) as key(attnum)
        join pg_attribute a on a.attrelid = conrelid and a.attnum = key.attnum
      ) = ARRAY['id']
  ) then
    raise exception 'Existing dhoip.stage_b_probe_resource has an incompatible primary key';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'dhoip.stage_b_employee_link'::regclass
      and conname = 'stage_b_employee_link_clerk_user_id_key'
      and contype = 'u'
      and (
        select array_agg(a.attname::text order by a.attnum)
        from unnest(conkey) as key(attnum)
        join pg_attribute a on a.attrelid = conrelid and a.attnum = key.attnum
      ) = ARRAY['clerk_user_id']
  ) then
    raise exception 'Existing dhoip.stage_b_employee_link lacks the required unique constraint on clerk_user_id';
  end if;

  select pg_get_constraintdef(c.oid)
  into status_constraint_def
  from pg_constraint c
  where c.conrelid = 'dhoip.stage_b_employee_link'::regclass
    and c.conname = 'stage_b_employee_link_status_check'
    and c.contype = 'c';

  if status_constraint_def is null then
    raise exception 'Existing dhoip.stage_b_employee_link lacks the required status check constraint';
  end if;

  -- Expected constraint: status = ANY (ARRAY['active'::text, 'inactive'::text, 'revoked'::text]).
  -- Normalization removes whitespace, grouping parentheses, and text casts before
  -- requiring the exact structure and the exact three-value set.
  status_constraint_def := regexp_replace(status_constraint_def, '\s+', '', 'g');
  status_constraint_def := regexp_replace(status_constraint_def, '[()]', '', 'g');
  status_constraint_def := regexp_replace(status_constraint_def, '::text(\[\])?', '', 'g');

  if status_constraint_def !~ '^CHECKstatus=ANYARRAY\[''[a-z]+''(,''[a-z]+''){2}\]$' then
    raise exception 'Existing dhoip.stage_b_employee_link has an unexpected status constraint expression: %', status_constraint_def;
  end if;

  select array_agg(matches[1] order by matches[1])
  into status_values
  from regexp_matches(status_constraint_def, '''([a-z]+)''', 'g') as matches;

  if status_values is distinct from ARRAY['active', 'inactive', 'revoked'] then
    raise exception 'Existing dhoip.stage_b_employee_link status constraint must permit exactly active, inactive, and revoked';
  end if;

  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'dhoip'
      and c.relname in ('stage_b_employee_link', 'stage_b_probe_resource')
      and (
        pg_get_userbyid(c.relowner) <> current_user
        or pg_get_userbyid(c.relowner) in (
          'dhoip_app',
          'authenticated',
          'anon',
          'service_role',
          'authenticator'
        )
      )
  ) then
    raise exception 'Probe tables must be owned by the trusted migration/admin identity and not a runtime role. Ownership was not changed.';
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'dhoip'
      and c.relname in ('stage_b_employee_link', 'stage_b_probe_resource')
      and (c.relrowsecurity or c.relforcerowsecurity)
  ) then
    raise exception 'Stage B probe tables already have RLS enabled. Run probe-down.sql before reapplying.';
  end if;
end
$$;

-- Seed before enabling or forcing RLS, using the migration/admin connection.
insert into dhoip.stage_b_employee_link (
  id,
  clerk_user_id,
  employee_ref,
  status
)
values
  (
    '00000000-0000-4000-8000-0000000000a1',
    'user_stage_b_active_a',
    'stage-b-employee-active-a',
    'active'
  ),
  (
    '00000000-0000-4000-8000-0000000000a2',
    'user_stage_b_active_b',
    'stage-b-employee-active-b',
    'active'
  ),
  (
    '00000000-0000-4000-8000-0000000000a3',
    'user_stage_b_inactive',
    'stage-b-employee-inactive',
    'inactive'
  ),
  (
    '00000000-0000-4000-8000-0000000000a4',
    'user_stage_b_revoked',
    'stage-b-employee-revoked',
    'revoked'
  )
on conflict (clerk_user_id) do update
set employee_ref = excluded.employee_ref,
    status = excluded.status;

insert into dhoip.stage_b_probe_resource (
  id,
  clerk_user_id,
  label
)
values
  (
    '00000000-0000-4000-8000-0000000000b1',
    'user_stage_b_active_a',
    'Active A'
  ),
  (
    '00000000-0000-4000-8000-0000000000b2',
    'user_stage_b_active_b',
    'Active B'
  )
on conflict (id) do update
set clerk_user_id = excluded.clerk_user_id,
    label = excluded.label;

alter table dhoip.stage_b_employee_link enable row level security;
alter table dhoip.stage_b_employee_link force row level security;
alter table dhoip.stage_b_probe_resource enable row level security;
alter table dhoip.stage_b_probe_resource force row level security;

drop policy if exists stage_b_employee_link_select_own
  on dhoip.stage_b_employee_link;
create policy stage_b_employee_link_select_own
  on dhoip.stage_b_employee_link
  for select
  to authenticated
  using (clerk_user_id = auth.jwt() ->> 'sub');

drop policy if exists stage_b_probe_resource_select_own_active
  on dhoip.stage_b_probe_resource;
create policy stage_b_probe_resource_select_own_active
  on dhoip.stage_b_probe_resource
  for select
  to authenticated
  using (
    clerk_user_id = auth.jwt() ->> 'sub'
    and exists (
      select 1
      from dhoip.stage_b_employee_link l
      where l.clerk_user_id = auth.jwt() ->> 'sub'
        and l.status = 'active'
    )
  );

-- Do not revoke schema-wide privileges: dhoip must remain isolated, and
-- schema-level grants may affect unrelated objects. Only probe objects change.
grant usage on schema dhoip to authenticated;

revoke all on dhoip.stage_b_employee_link from public;
revoke all on dhoip.stage_b_employee_link from anon;
revoke all on dhoip.stage_b_employee_link from authenticated;
grant select on dhoip.stage_b_employee_link to authenticated;

revoke all on dhoip.stage_b_probe_resource from public;
revoke all on dhoip.stage_b_probe_resource from anon;
revoke all on dhoip.stage_b_probe_resource from authenticated;
grant select on dhoip.stage_b_probe_resource to authenticated;

commit;
