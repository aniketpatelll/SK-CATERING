-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
create table if not exists orders (
  id   bigint primary key,
  data jsonb  not null
);

alter table orders enable row level security;

create policy "anyone can read orders"   on orders for select using (true);
create policy "anyone can add orders"    on orders for insert with check (true);
create policy "anyone can delete orders" on orders for delete using (true);
