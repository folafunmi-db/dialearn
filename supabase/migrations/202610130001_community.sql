-- Run on a Supabase project. Authentication emails live only in auth.users.
-- No service-role key belongs in the website. Educator roles are granted by an administrator.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Curious learner' check(char_length(display_name) between 2 and 50),
 bio text not null default '' check(char_length(bio)<=600),
 role text not null default 'learner' check(role in ('learner','educator','moderator')),
 created_at timestamptz not null default now()
);
create function public.new_learner() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id) values(new.id); return new; end $$;
create trigger new_learner after insert on auth.users for each row execute function public.new_learner();
insert into public.profiles(id) select id from auth.users on conflict do nothing;
create function public.is_educator() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=(select auth.uid()) and role in ('educator','moderator')); $$;
create function public.is_moderator() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=(select auth.uid()) and role='moderator'); $$;
create table public.educator_requests(user_id uuid primary key references public.profiles on delete cascade,reason text not null check(char_length(reason) between 20 and 1000),created_at timestamptz not null default now());
create table public.lessons (
 id uuid primary key default gen_random_uuid(), educator_id uuid not null references public.profiles on delete cascade,
 title text not null check(char_length(title) between 5 and 120),summary text not null check(char_length(summary) between 20 and 400),
 body text not null check(char_length(body) between 50 and 20000),challenge text not null check(char_length(challenge) between 10 and 2000),
 schematic_description text not null check(char_length(schematic_description) between 20 and 4000),schematic_path text,
 sources text[] not null check(cardinality(sources) between 1 and 8),
 language text not null default 'English' check(char_length(language) between 2 and 60),
 stage text not null check(stage in ('foundations','systems','engineering')),object_id text not null default '' check(object_id='' or object_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 status text not null default 'draft' check(status in ('draft','published')),created_at timestamptz not null default now(),published_at timestamptz
);
create table public.subscriptions(learner_id uuid not null references public.profiles on delete cascade,educator_id uuid not null references public.profiles on delete cascade,created_at timestamptz not null default now(),primary key(learner_id,educator_id),check(learner_id<>educator_id));
create table public.lesson_progress(user_id uuid not null references public.profiles on delete cascade,lesson_id uuid not null references public.lessons on delete cascade,saved boolean not null default false,completed boolean not null default false,reflection text not null default '' check(char_length(reflection)<=2000),updated_at timestamptz not null default now(),primary key(user_id,lesson_id));
create table public.discussions(id uuid primary key default gen_random_uuid(),lesson_id uuid not null references public.lessons on delete cascade,author_id uuid not null references public.profiles on delete cascade,body text not null check(char_length(body) between 3 and 2000),status text not null default 'pending' check(status in ('pending','approved','hidden')),created_at timestamptz not null default now());
create table public.discussion_reports(id uuid primary key default gen_random_uuid(),discussion_id uuid not null references public.discussions on delete cascade,reporter_id uuid not null references public.profiles on delete cascade,reason text not null check(char_length(reason) between 3 and 1000),created_at timestamptz not null default now(),unique(discussion_id,reporter_id));
create table public.notifications(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles on delete cascade,lesson_id uuid not null references public.lessons on delete cascade,title text not null,created_at timestamptz not null default now(),read_at timestamptz,unique(user_id,lesson_id));
create index lessons_published on public.lessons(published_at desc) where status='published';
create index discussions_lesson on public.discussions(lesson_id,created_at);
create index subscriptions_educator on public.subscriptions(educator_id);
create index notifications_user on public.notifications(user_id,created_at desc);
create function public.validate_lesson() returns trigger language plpgsql set search_path='' as $$
declare link text;
begin
 foreach link in array new.sources loop if link !~ '^https://[A-Za-z0-9][A-Za-z0-9.-]*(:[0-9]{1,5})?([/?#][^[:space:]]*)?$' then raise exception 'Use valid HTTPS sources'; end if; end loop;
 if new.schematic_path is not null and new.schematic_path not like new.educator_id::text || '/%' then raise exception 'Invalid schematic owner'; end if;
 if new.status='published' and (TG_OP='INSERT' or old.status<>'published') then new.published_at=now(); end if;
 return new;
end $$;
create trigger validate_lesson before insert or update on public.lessons for each row execute function public.validate_lesson();
create function public.lesson_drop() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='published' and (TG_OP='INSERT' or old.status<>'published') then
  insert into public.notifications(user_id,lesson_id,title) select learner_id,new.id,new.title from public.subscriptions where educator_id=new.educator_id on conflict(user_id,lesson_id) do nothing;
 end if; return new;
end $$;
create trigger lesson_drop after insert or update on public.lessons for each row execute function public.lesson_drop();
create function public.discussion_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.discussions where author_id=new.author_id and created_at>now()-interval '30 seconds') then raise exception 'Please wait before posting another question'; end if;
 return new;
end $$;
create trigger discussion_guard before insert on public.discussions for each row execute function public.discussion_guard();
-- Database permissions: users cannot promote their role or forge notification records.
alter table public.profiles enable row level security;
alter table public.educator_requests enable row level security;
alter table public.lessons enable row level security;
alter table public.subscriptions enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_reports enable row level security;
alter table public.notifications enable row level security;
revoke all on public.profiles,public.educator_requests,public.lessons,public.subscriptions,public.lesson_progress,public.discussions,public.discussion_reports,public.notifications from anon;
revoke all on public.profiles,public.educator_requests,public.lessons,public.subscriptions,public.lesson_progress,public.discussions,public.discussion_reports,public.notifications from authenticated;
grant select on public.profiles to authenticated;
grant update(display_name,bio) on public.profiles to authenticated;
grant select,insert on public.educator_requests to authenticated;
grant select,insert,update,delete on public.lessons,public.subscriptions,public.lesson_progress to authenticated;
grant select,insert on public.discussions to authenticated;
grant update(status) on public.discussions to authenticated;
grant select,insert on public.discussion_reports to authenticated;
grant select on public.notifications to authenticated;
grant update(read_at) on public.notifications to authenticated;
create policy profiles_read on public.profiles for select to authenticated using(true);
create policy profile_edit on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy request_own on public.educator_requests for insert to authenticated with check(user_id=(select auth.uid()));
create policy request_read on public.educator_requests for select to authenticated using(user_id=(select auth.uid()) or public.is_moderator());
create policy lesson_read on public.lessons for select to authenticated using(status='published' or educator_id=(select auth.uid()) or public.is_moderator());
create policy lesson_create on public.lessons for insert to authenticated with check(educator_id=(select auth.uid()) and public.is_educator());
create policy lesson_edit on public.lessons for update to authenticated using((educator_id=(select auth.uid()) and public.is_educator()) or public.is_moderator()) with check((educator_id=(select auth.uid()) and public.is_educator()) or public.is_moderator());
create policy lesson_delete on public.lessons for delete to authenticated using(educator_id=(select auth.uid()) or public.is_moderator());
create policy subscribe_read on public.subscriptions for select to authenticated using(learner_id=(select auth.uid()));
create policy subscribe_create on public.subscriptions for insert to authenticated with check(learner_id=(select auth.uid()) and exists(select 1 from public.profiles where id=educator_id and role in ('educator','moderator')));
create policy subscribe_delete on public.subscriptions for delete to authenticated using(learner_id=(select auth.uid()));
create policy progress_read on public.lesson_progress for select to authenticated using(user_id=(select auth.uid()));
create policy progress_create on public.lesson_progress for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.lessons where id=lesson_id and status='published'));
create policy progress_edit on public.lesson_progress for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy progress_delete on public.lesson_progress for delete to authenticated using(user_id=(select auth.uid()));
create policy discussion_read on public.discussions for select to authenticated using((status='approved' and exists(select 1 from public.lessons where id=lesson_id and status='published')) or author_id=(select auth.uid()) or exists(select 1 from public.lessons where id=lesson_id and educator_id=(select auth.uid())) or public.is_moderator());
create policy discussion_create on public.discussions for insert to authenticated with check(author_id=(select auth.uid()) and status='pending' and exists(select 1 from public.lessons where id=lesson_id and status='published'));
create policy discussion_moderate on public.discussions for update to authenticated using(exists(select 1 from public.lessons where id=lesson_id and educator_id=(select auth.uid())) or public.is_moderator()) with check(exists(select 1 from public.lessons where id=lesson_id and educator_id=(select auth.uid())) or public.is_moderator());
create policy report_create on public.discussion_reports for insert to authenticated with check(reporter_id=(select auth.uid()));
create policy report_read on public.discussion_reports for select to authenticated using(reporter_id=(select auth.uid()) or public.is_moderator() or exists(select 1 from public.discussions d join public.lessons l on l.id=d.lesson_id where d.id=discussion_id and l.educator_id=(select auth.uid())));
create policy notice_read on public.notifications for select to authenticated using(user_id=(select auth.uid()));
create policy notice_seen on public.notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('lesson-schematics','lesson-schematics',false,5242880,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy schematic_upload on storage.objects for insert to authenticated with check(bucket_id='lesson-schematics' and (storage.foldername(name))[1]=(select auth.uid())::text and public.is_educator());
create policy schematic_read on storage.objects for select to authenticated using(bucket_id='lesson-schematics' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(select 1 from public.lessons where schematic_path=name and status='published') or public.is_moderator()));
create policy schematic_delete on storage.objects for delete to authenticated using(bucket_id='lesson-schematics' and (storage.foldername(name))[1]=(select auth.uid())::text);
-- Only the account itself can invoke deletion; cascading foreign keys remove its private records.
create function public.delete_my_account() returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if exists(select 1 from storage.objects where bucket_id='lesson-schematics' and owner_id=auth.uid()::text) then raise exception 'Delete your schematic uploads before deleting your account'; end if;
 delete from auth.users where id=auth.uid();
end $$;
revoke execute on function public.delete_my_account() from public,anon;
grant execute on function public.delete_my_account() to authenticated;
commit;
