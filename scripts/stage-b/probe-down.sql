begin;

-- Removes only validated Stage B probe tables. No CASCADE is used, so any
-- unexpected dependency causes the transaction to fail before unrelated
-- objects can be removed. The dhoip schema and dhoip_app role are retained.
do $$
declare
  employee_link_oid oid;
  employee_link_relkind text;
  employee_link_is_partition boolean;
  employee_link_owner text;
  resource_oid oid;
  resource_relkind text;
  resource_is_partition boolean;
  resource_owner text;
  employee_link_column_count integer;
  employee_link_matching_columns integer;
  resource_column_count integer;
  resource_matching_columns integer;
  status_constraint_def text;
  status_values text[];
begin
  if current_user in (
    'dhoip_app',
    'authenticated',
    'anon',
    'service_role',
    'authenticator'
  ) then
    raise exception 'Stage B probe-down must be run by the migration/admin identity, not a runtime role';
  end if;

  if not exists (select 1 from pg_namespace where nspname = 'dhoip') then
    raise notice 'Schema dhoip does not exist; no Stage B probe tables to remove.';
    return;
  end if;

  select c.oid, c.relkind::text, c.relispartition, pg_get_userbyid(c.relowner)
  into employee_link_oid, employee_link_relkind, employee_link_is_partition, employee_link_owner
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'dhoip'
    and c.relname = 'stage_b_employee_link';

  if employee_link_oid is not null then
    if employee_link_relkind <> 'r' or employee_link_is_partition then
      raise exception 'Refusing to drop dhoip.stage_b_employee_link: expected an ordinary non-partition table, found relation kind %', employee_link_relkind;
    end if;

    if employee_link_owner <> current_user
      or employee_link_owner in (
        'dhoip_app',
        'authenticated',
        'anon',
        'service_role',
        'authenticator'
      )
    then
      raise exception 'Refusing to drop dhoip.stage_b_employee_link: owner % is not the trusted migration/admin identity %', employee_link_owner, current_user;
    end if;

    select count(*) into employee_link_column_count
    from information_schema.columns
    where table_schema = 'dhoip'
      and table_name = 'stage_b_employee_link';

    select count(*) into employee_link_matching_columns
    from information_schema.columns
    where table_schema = 'dhoip'
      and table_name = 'stage_b_employee_link'
      and (
        (column_name = 'id' and udt_name = 'uuid' and is_nullable = 'NO')
        or (column_name = 'clerk_user_id' and udt_name = 'text' and is_nullable = 'NO')
        or (column_name = 'employee_ref' and udt_name = 'text' and is_nullable = 'NO')
        or (column_name = 'status' and udt_name = 'text' and is_nullable = 'NO')
      );

    if employee_link_column_count <> 4 or employee_link_matching_columns <> 4 then
      raise exception 'Refusing to drop dhoip.stage_b_employee_link: incompatible column definition';
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conrelid = employee_link_oid
        and contype = 'p'
        and (
          select array_agg(a.attname::text order by a.attnum)
          from unnest(conkey) as key(attnum)
          join pg_attribute a on a.attrelid = employee_link_oid and a.attnum = key.attnum
        ) = ARRAY['id']
    ) then
      raise exception 'Refusing to drop dhoip.stage_b_employee_link: primary key is not exclusively on id';
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conrelid = employee_link_oid
        and contype = 'u'
        and (
          select array_agg(a.attname::text order by a.attnum)
          from unnest(conkey) as key(attnum)
          join pg_attribute a on a.attrelid = employee_link_oid and a.attnum = key.attnum
        ) = ARRAY['clerk_user_id']
    ) then
      raise exception 'Refusing to drop dhoip.stage_b_employee_link: required unique constraint on clerk_user_id is missing';
    end if;

    select pg_get_constraintdef(c.oid)
    into status_constraint_def
    from pg_constraint c
    where c.conrelid = employee_link_oid
      and c.conname = 'stage_b_employee_link_status_check'
      and c.contype = 'c';

    if status_constraint_def is null then
      raise exception 'Refusing to drop dhoip.stage_b_employee_link: required status check constraint is missing';
    end if;

    -- Expected constraint: status = ANY (ARRAY['active'::text, 'inactive'::text, 'revoked'::text]).
    -- Normalization removes whitespace, grouping parentheses, and text casts before
    -- requiring the exact structure and the exact three-value set.
    status_constraint_def := regexp_replace(status_constraint_def, '\s+', '', 'g');
    status_constraint_def := regexp_replace(status_constraint_def, '[()]', '', 'g');
    status_constraint_def := regexp_replace(status_constraint_def, '::text(\[\])?', '', 'g');

    if status_constraint_def !~ '^CHECKstatus=ANYARRAY\[''[a-z]+''(,''[a-z]+''){2}\]$' then
      raise exception 'Refusing to drop dhoip.stage_b_employee_link: unexpected status constraint expression';
    end if;

    select array_agg(matches[1] order by matches[1])
    into status_values
    from regexp_matches(status_constraint_def, '''([a-z]+)''', 'g') as matches;

    if status_values is distinct from ARRAY['active', 'inactive', 'revoked'] then
      raise exception 'Refusing to drop dhoip.stage_b_employee_link: status constraint does not permit exactly active, inactive, and revoked';
    end if;
  end if;

  select c.oid, c.relkind::text, c.relispartition, pg_get_userbyid(c.relowner)
  into resource_oid, resource_relkind, resource_is_partition, resource_owner
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'dhoip'
    and c.relname = 'stage_b_probe_resource';

  if resource_oid is not null then
    if resource_relkind <> 'r' or resource_is_partition then
      raise exception 'Refusing to drop dhoip.stage_b_probe_resource: expected an ordinary non-partition table, found relation kind %', resource_relkind;
    end if;

    if resource_owner <> current_user
      or resource_owner in (
        'dhoip_app',
        'authenticated',
        'anon',
        'service_role',
        'authenticator'
      )
    then
      raise exception 'Refusing to drop dhoip.stage_b_probe_resource: owner % is not the trusted migration/admin identity %', resource_owner, current_user;
    end if;

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

    if resource_column_count <> 3 or resource_matching_columns <> 3 then
      raise exception 'Refusing to drop dhoip.stage_b_probe_resource: incompatible column definition';
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conrelid = resource_oid
        and contype = 'p'
        and (
          select array_agg(a.attname::text order by a.attnum)
          from unnest(conkey) as key(attnum)
          join pg_attribute a on a.attrelid = resource_oid and a.attnum = key.attnum
        ) = ARRAY['id']
    ) then
      raise exception 'Refusing to drop dhoip.stage_b_probe_resource: primary key is not exclusively on id';
    end if;
  end if;

  if resource_oid is not null then
    execute 'drop table dhoip.stage_b_probe_resource restrict';
  end if;

  if employee_link_oid is not null then
    execute 'drop table dhoip.stage_b_employee_link restrict';
  end if;
end
$$;

commit;
