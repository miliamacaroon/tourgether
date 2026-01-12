-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create attractions table
CREATE TABLE public.attractions (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  tripadvisor_url TEXT,
  attraction_url TEXT,
  picture TEXT,
  rating NUMERIC(3,2),
  destination TEXT NOT NULL,
  description TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  general_location TEXT,
  number_of_reviews INTEGER DEFAULT 0,
  review_tags TEXT[],
  categories TEXT[],
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create restaurants table
CREATE TABLE public.restaurants (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  tripadvisor_url TEXT,
  restaurant_url TEXT,
  picture TEXT,
  rating NUMERIC(3,2),
  destination TEXT NOT NULL,
  description TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  general_location TEXT,
  number_of_reviews INTEGER DEFAULT 0,
  review_tags TEXT[],
  cuisines TEXT[],
  dishes TEXT[],
  meal_types TEXT[],
  features TEXT[],
  hours JSONB,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_attractions_destination ON public.attractions(destination);
CREATE INDEX idx_attractions_rating ON public.attractions(rating DESC);
CREATE INDEX idx_attractions_categories ON public.attractions USING GIN(categories);
CREATE INDEX idx_attractions_embedding ON public.attractions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_restaurants_destination ON public.restaurants(destination);
CREATE INDEX idx_restaurants_rating ON public.restaurants(rating DESC);
CREATE INDEX idx_restaurants_cuisines ON public.restaurants USING GIN(cuisines);
CREATE INDEX idx_restaurants_embedding ON public.restaurants USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS (public read access for travel data)
ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read attractions"
ON public.attractions FOR SELECT
USING (true);

CREATE POLICY "Public can read restaurants"
ON public.restaurants FOR SELECT
USING (true);

-- Create similarity search functions
CREATE OR REPLACE FUNCTION public.search_attractions(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_destination TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  picture TEXT,
  rating NUMERIC,
  destination TEXT,
  categories TEXT[],
  latitude NUMERIC,
  longitude NUMERIC,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.description,
    a.picture,
    a.rating,
    a.destination,
    a.categories,
    a.latitude,
    a.longitude,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM attractions a
  WHERE 
    a.embedding IS NOT NULL
    AND (filter_destination IS NULL OR a.destination ILIKE '%' || filter_destination || '%')
    AND 1 - (a.embedding <=> query_embedding) > match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_restaurants(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_destination TEXT DEFAULT NULL,
  filter_cuisines TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  picture TEXT,
  rating NUMERIC,
  destination TEXT,
  cuisines TEXT[],
  latitude NUMERIC,
  longitude NUMERIC,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.description,
    r.picture,
    r.rating,
    r.destination,
    r.cuisines,
    r.latitude,
    r.longitude,
    1 - (r.embedding <=> query_embedding) AS similarity
  FROM restaurants r
  WHERE 
    r.embedding IS NOT NULL
    AND (filter_destination IS NULL OR r.destination ILIKE '%' || filter_destination || '%')
    AND (filter_cuisines IS NULL OR r.cuisines && filter_cuisines)
    AND 1 - (r.embedding <=> query_embedding) > match_threshold
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;