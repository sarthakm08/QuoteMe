-- ==============================================================================
-- ChronoQuotes — Supabase PostgreSQL Database Schema & Seed Data
-- Time-Based Quote Discovery Platform
-- ==============================================================================

-- 1. Create table for Quotes
CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    genres TEXT[] NOT NULL DEFAULT '{}',
    time_categories TEXT[] NOT NULL DEFAULT '{}',
    source TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Performance Indexes for Fast Multi-genre & Time Queries
CREATE INDEX IF NOT EXISTS idx_quotes_genres ON quotes USING GIN (genres);
CREATE INDEX IF NOT EXISTS idx_quotes_time_categories ON quotes USING GIN (time_categories);
CREATE INDEX IF NOT EXISTS idx_quotes_author ON quotes (author);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes (created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all verified quotes
CREATE POLICY "Allow public read access to quotes"
    ON quotes
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated or service role to insert quotes
CREATE POLICY "Allow authenticated quote insertions"
    ON quotes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. Favorites table (Optional if multi-device auth is enabled)
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id TEXT REFERENCES quotes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, quote_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
    ON user_favorites
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Seed Initial Curated Quotes
INSERT INTO quotes (id, text, author, genres, time_categories, source, language, is_verified)
VALUES
('quote-001', 'At dawn, when you have trouble getting out of bed, tell yourself: ‘I have to go to work—as a human being. What do I have to complain of, if I’m going to do what I was born for?’', 'Marcus Aurelius', ARRAY['Stoicism', 'Discipline & Consistency', 'Philosophy'], ARRAY['early_morning'], 'Meditations, Book V', 'en', true),
('quote-002', 'You do not rise to the level of your goals. You fall to the level of your systems. Your goal is your desired outcome toward which you direct your efforts.', 'James Clear', ARRAY['Discipline & Consistency', 'Motivation', 'Success & Ambition'], ARRAY['early_morning', 'morning'], 'Atomic Habits', 'en', true),
('quote-003', 'Arise, awake, and stop not until the goal is reached. All power is within you; you can do anything and everything.', 'Swami Vivekananda', ARRAY['Bhagavad Gita & Indian Wisdom', 'Motivation', 'Spirituality', 'Confidence'], ARRAY['early_morning', 'morning'], 'Lectures from Colombo to Almora', 'en', true),
('quote-007', 'Reshape yourself through the power of your will; never let yourself be degraded by self-will. The will is the only friend of the self, and the will is the only enemy of the self.', 'Lord Krishna (Bhagavad Gita)', ARRAY['Bhagavad Gita & Indian Wisdom', 'Discipline & Consistency', 'Philosophy', 'Spirituality'], ARRAY['early_morning'], 'Bhagavad Gita, Chapter 6, Verse 5', 'en', true),
('quote-011', 'You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results, nor be attached to inaction.', 'Lord Krishna (Bhagavad Gita)', ARRAY['Bhagavad Gita & Indian Wisdom', 'Philosophy', 'Discipline & Consistency', 'Leadership'], ARRAY['morning', 'afternoon'], 'Bhagavad Gita, Chapter 2, Verse 47', 'en', true),
('quote-013', 'The impediment to action advances action. What stands in the way becomes the way.', 'Marcus Aurelius', ARRAY['Stoicism', 'Motivation', 'Philosophy', 'Success & Ambition'], ARRAY['morning', 'afternoon'], 'Meditations, Book V.20', 'en', true),
('quote-021', 'When we are no longer able to change a situation, we are challenged to change ourselves.', 'Viktor E. Frankl', ARRAY['Psychology', 'Stoicism', 'Philosophy'], ARRAY['afternoon'], 'Man’s Search for Meaning', 'en', true),
('quote-023', 'It is not that we have a short time to live, but that we waste a lot of it. Life is long if you know how to use it.', 'Seneca', ARRAY['Stoicism', 'Philosophy', 'Life Lessons', 'Minimalism'], ARRAY['afternoon', 'night'], 'On the Shortness of Life, I.1', 'en', true),
('quote-031', 'Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray.', 'Rumi', ARRAY['Love & Relationships', 'Spirituality', 'Philosophy'], ARRAY['evening'], 'The Masnavi', 'en', true),
('quote-032', 'Clouds come floating into my life, no longer to carry rain or usher storm, but to add color to my sunset sky.', 'Rabindranath Tagore', ARRAY['Bhagavad Gita & Indian Wisdom', 'Creativity', 'Spirituality', 'Life Lessons'], ARRAY['evening'], 'Stray Birds, Poem 292', 'en', true),
('quote-041', 'The unexamined life is not worth living.', 'Socrates', ARRAY['Philosophy', 'Dark Academia', 'Life Lessons'], ARRAY['night'], 'Plato’s Apology (38a)', 'en', true),
('quote-042', 'You have power over your mind—not outside events. Realize this, and you will find strength.', 'Marcus Aurelius', ARRAY['Stoicism', 'Self-Respect & Boundaries', 'Psychology'], ARRAY['night'], 'Meditations, Book IV.3', 'en', true),
('quote-051', 'In the midst of winter, I found there was, within me, an invincible summer. And that makes me happy.', 'Albert Camus', ARRAY['Existentialism', 'Philosophy', 'Dark Academia', 'Confidence'], ARRAY['late_night'], 'Return to Tipasa (L’Été)', 'en', true),
('quote-052', 'The mystery of human existence lies not in just staying alive, but in finding something to live for.', 'Fyodor Dostoevsky', ARRAY['Dark Academia', 'Existentialism', 'Philosophy', 'Psychology'], ARRAY['late_night'], 'The Brothers Karamazov', 'en', true)
ON CONFLICT (id) DO NOTHING;
