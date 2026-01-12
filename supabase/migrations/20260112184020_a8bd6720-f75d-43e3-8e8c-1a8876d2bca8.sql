-- Create predictions table to store YOLO model results
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  predicted_location TEXT NOT NULL,
  predicted_region TEXT,
  confidence NUMERIC NOT NULL DEFAULT 0,
  model_name TEXT DEFAULT 'yolov11',
  session_id TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_predictions_predicted_location ON public.predictions(predicted_location);
CREATE INDEX idx_predictions_predicted_region ON public.predictions(predicted_region);
CREATE INDEX idx_predictions_session_id ON public.predictions(session_id);

-- Enable Row Level Security
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read predictions (for now)
CREATE POLICY "Anyone can read predictions" 
ON public.predictions 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert predictions
CREATE POLICY "Anyone can insert predictions" 
ON public.predictions 
FOR INSERT 
WITH CHECK (true);

-- Add embedding generation function for text
CREATE OR REPLACE FUNCTION generate_embedding_text(
  attraction_row public.attractions
) RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(attraction_row.name, '') || ' ' || 
         COALESCE(attraction_row.description, '') || ' ' ||
         COALESCE(attraction_row.destination, '') || ' ' ||
         COALESCE(attraction_row.general_location, '') || ' ' ||
         COALESCE(array_to_string(attraction_row.categories, ', '), '') || ' ' ||
         COALESCE(array_to_string(attraction_row.review_tags, ', '), '');
END;
$$ LANGUAGE plpgsql STABLE;

-- Add embedding generation function for restaurants
CREATE OR REPLACE FUNCTION generate_restaurant_text(
  restaurant_row public.restaurants
) RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(restaurant_row.name, '') || ' ' || 
         COALESCE(restaurant_row.description, '') || ' ' ||
         COALESCE(restaurant_row.destination, '') || ' ' ||
         COALESCE(restaurant_row.general_location, '') || ' ' ||
         COALESCE(array_to_string(restaurant_row.cuisines, ', '), '') || ' ' ||
         COALESCE(array_to_string(restaurant_row.dishes, ', '), '') || ' ' ||
         COALESCE(array_to_string(restaurant_row.meal_types, ', '), '') || ' ' ||
         COALESCE(array_to_string(restaurant_row.review_tags, ', '), '');
END;
$$ LANGUAGE plpgsql STABLE;

-- Create hybrid search function for attractions
CREATE OR REPLACE FUNCTION hybrid_search_attractions(
  query_text TEXT,
  query_embedding vector(3072),
  destination_filter TEXT DEFAULT NULL,
  match_count INT DEFAULT 10,
  vector_weight FLOAT DEFAULT 0.6,
  text_weight FLOAT DEFAULT 0.4
) RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  picture TEXT,
  destination TEXT,
  rating NUMERIC,
  categories TEXT[],
  general_location TEXT,
  similarity_score FLOAT,
  text_score FLOAT,
  combined_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH vector_search AS (
    SELECT 
      a.id,
      1 - (a.embedding <=> query_embedding) AS vector_similarity
    FROM attractions a
    WHERE a.embedding IS NOT NULL
      AND (destination_filter IS NULL OR LOWER(a.destination) LIKE '%' || LOWER(destination_filter) || '%')
    ORDER BY a.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  text_search AS (
    SELECT 
      a.id,
      ts_rank_cd(
        to_tsvector('english', 
          COALESCE(a.name, '') || ' ' || 
          COALESCE(a.description, '') || ' ' ||
          COALESCE(array_to_string(a.categories, ' '), '') || ' ' ||
          COALESCE(array_to_string(a.review_tags, ' '), '')
        ),
        plainto_tsquery('english', query_text)
      ) AS text_rank
    FROM attractions a
    WHERE (destination_filter IS NULL OR LOWER(a.destination) LIKE '%' || LOWER(destination_filter) || '%')
    ORDER BY text_rank DESC
    LIMIT match_count * 2
  ),
  combined AS (
    SELECT 
      COALESCE(vs.id, ts.id) AS id,
      COALESCE(vs.vector_similarity, 0) AS sim,
      COALESCE(ts.text_rank, 0) AS txt
    FROM vector_search vs
    FULL OUTER JOIN text_search ts ON vs.id = ts.id
  )
  SELECT 
    a.id,
    a.name,
    a.description,
    a.picture,
    a.destination,
    a.rating,
    a.categories,
    a.general_location,
    c.sim::FLOAT AS similarity_score,
    c.txt::FLOAT AS text_score,
    (c.sim * vector_weight + c.txt * text_weight)::FLOAT AS combined_score
  FROM combined c
  JOIN attractions a ON a.id = c.id
  ORDER BY (c.sim * vector_weight + c.txt * text_weight) DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create hybrid search function for restaurants
CREATE OR REPLACE FUNCTION hybrid_search_restaurants(
  query_text TEXT,
  query_embedding vector(3072),
  destination_filter TEXT DEFAULT NULL,
  cuisine_filter TEXT[] DEFAULT NULL,
  match_count INT DEFAULT 5,
  vector_weight FLOAT DEFAULT 0.6,
  text_weight FLOAT DEFAULT 0.4
) RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  picture TEXT,
  destination TEXT,
  rating NUMERIC,
  cuisines TEXT[],
  general_location TEXT,
  similarity_score FLOAT,
  text_score FLOAT,
  combined_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH vector_search AS (
    SELECT 
      r.id,
      1 - (r.embedding <=> query_embedding) AS vector_similarity
    FROM restaurants r
    WHERE r.embedding IS NOT NULL
      AND (destination_filter IS NULL OR LOWER(r.destination) LIKE '%' || LOWER(destination_filter) || '%')
      AND (cuisine_filter IS NULL OR r.cuisines && cuisine_filter)
    ORDER BY r.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  text_search AS (
    SELECT 
      r.id,
      ts_rank_cd(
        to_tsvector('english', 
          COALESCE(r.name, '') || ' ' || 
          COALESCE(r.description, '') || ' ' ||
          COALESCE(array_to_string(r.cuisines, ' '), '') || ' ' ||
          COALESCE(array_to_string(r.dishes, ' '), '')
        ),
        plainto_tsquery('english', query_text)
      ) AS text_rank
    FROM restaurants r
    WHERE (destination_filter IS NULL OR LOWER(r.destination) LIKE '%' || LOWER(destination_filter) || '%')
      AND (cuisine_filter IS NULL OR r.cuisines && cuisine_filter)
    ORDER BY text_rank DESC
    LIMIT match_count * 2
  ),
  combined AS (
    SELECT 
      COALESCE(vs.id, ts.id) AS id,
      COALESCE(vs.vector_similarity, 0) AS sim,
      COALESCE(ts.text_rank, 0) AS txt
    FROM vector_search vs
    FULL OUTER JOIN text_search ts ON vs.id = ts.id
  )
  SELECT 
    r.id,
    r.name,
    r.description,
    r.picture,
    r.destination,
    r.rating,
    r.cuisines,
    r.general_location,
    c.sim::FLOAT AS similarity_score,
    c.txt::FLOAT AS text_score,
    (c.sim * vector_weight + c.txt * text_weight)::FLOAT AS combined_score
  FROM combined c
  JOIN restaurants r ON r.id = c.id
  ORDER BY (c.sim * vector_weight + c.txt * text_weight) DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;