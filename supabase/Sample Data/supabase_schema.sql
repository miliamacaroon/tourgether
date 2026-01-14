
-- 1. Main Table: Attractions (from attractions_database.csv)
create table public.attractions (
  "ID" bigint not null,
  "NAME" text null,
  "PICTURE" text null,
  "RATING" double precision null,
  "DESTINATION" text null,
  "DESCRIPTION" text null,
  "REVIEW_TAGS" text null,
  "CATEGORIES" text null,
  "LOCAL_IMAGE" text null,
  "ATTRACTION_CLASS" text null,
  fts_index tsvector GENERATED ALWAYS as (
    to_tsvector(
      'english'::regconfig,
      (
        (
          (
            (COALESCE("NAME", ''::text) || ' '::text) || COALESCE("DESCRIPTION", ''::text)
          ) || ' '::text
        ) || COALESCE("REVIEW_TAGS", ''::text)
      )
    )
  ) STORED null,
  constraint attractions_database_pkey primary key ("ID")
) TABLESPACE pg_default;

create index IF not exists fts_idx on public.attractions using gin (fts_index) TABLESPACE pg_default;

create table public.vision_predictions (
  id bigserial not null,
  created_at timestamp with time zone null default now(),
  image_name text not null,
  predicted_location text not null,
  confidence numeric(5, 4) not null,
  status text null default 'classified'::text,
  constraint vision_predictions_pkey primary key (id)
) TABLESPACE pg_default;

create table public.itineraries (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  destination text not null,
  budget_level text null,
  trip_duration_days integer null,
  content text null,
  structured_data jsonb null,
  created_at timestamp with time zone null default now(),
  constraint itineraries_pkey primary key (id),
  constraint itineraries_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;
