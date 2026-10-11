# ChronoQuotes — Time-Based Quote Discovery Platform

> A thought-provoking, circadian-synchronized quote platform designed with modern minimalism, editorial typography, and quiet luxury. Calibrated to **Indian Standard Time (IST, UTC+05:30)**.

---

## 1. Project Overview

**ChronoQuotes** delivers an intentional reading experience harmonized with the exact rhythm of day and night. The platform blends the focus of a minimalist productivity companion, the introspection of a philosophical journal, and the craftsmanship of an editorial website.

Whether viewed in Mumbai, London, New York, or Tokyo, ChronoQuotes automatically detects and displays quotes attuned to **Indian Standard Time (Asia/Kolkata)**.

---

## 2. Core Features

### 🕒 Time-Based Circadian Engine
The day is divided into six distinct philosophical moods:
1. **Early Morning (5:00 AM – 8:00 AM)**: *Dawn of Discipline* — Discipline, fresh starts, ambition, habits, focus, and self-improvement.
2. **Morning (8:00 AM – 12:00 PM)**: *Morning Momentum* — Productivity, confidence, creativity, learning, and success.
3. **Afternoon (12:00 PM – 4:00 PM)**: *Midday Equanimity* — Resilience, patience, mindfulness, consistency, and perseverance.
4. **Evening (4:00 PM – 7:00 PM)**: *Twilight Reflection* — Reflection, gratitude, relationships, balance, and personal growth.
5. **Night (7:00 PM – 11:00 PM)**: *Night Contemplation* — Philosophy, introspection, stoicism, purpose, and deep thinking.
6. **Late Night (11:00 PM – 5:00 AM)**: *Midnight Solitude* — Existentialism, solitude, creativity, emotional resilience, and quiet reflection.

- **Live IST Digital Clock**: Shows live hours, minutes, seconds, AM/PM, weekday, and date.
- **Dynamic Greeting & Ambience**: Smooth circadian ambient gradients change to match the time of day.
- **Time Slot Navigator**: Allows previewing quotes from any time period without changing device settings.

---

### 🏷️ 18-Genre Multi-Select Filtering System
Explore across 18 curated themes with custom icons and instant filtering:
- Motivation
- Discipline & Consistency
- Stoicism
- Philosophy
- Love & Relationships
- Self-Respect & Boundaries
- Success & Ambition
- Psychology
- Mindfulness
- Confidence
- Existentialism
- Creativity
- Leadership
- Life Lessons
- Dark Academia
- Spirituality
- Bhagavad Gita & Indian Wisdom
- Minimalism

**Progressive Relaxation Algorithm**:
If a user selects genres that currently have no direct quote assigned to the active time slot, the engine intelligently and politely relaxes the time-slot constraint while strictly preserving the chosen genre, informing the user with an "Expanded Slot" badge instead of an empty page.

---

### 📖 Editorial Quote Centerpiece
- **Typography**: Editorial serif (*Lora* / *Playfair Display*) with generous line-height and whitespace.
- **Attribution**: Verified authors (Marcus Aurelius, Lord Krishna, Albert Camus, Seneca, Lao Tzu, Carl Jung, Virginia Woolf, etc.) with exact work citations.
- **Actions**:
  - **Bookmark / Favorite**: Animated toggle persisted to `localStorage`.
  - **Copy to Clipboard**: Formatted quote with author attribution and visual toast feedback.
  - **Web Share API**: Native share dialog on mobile/supported desktop browsers with fallback.
  - **Next Quote**: Smooth rotation prioritizing unviewed quotes over previously seen ones.
  - **Curated Counter**: Displays the quote's position in the active recommendation pool.

---

### ⏳ IST Time Traveler Simulator Mode
Built directly into the navbar:
- Test the application instantly at key test times:
  - `5:30 AM` (Early Morning — Habits & Ambition)
  - `10:00 AM` (Morning — Productivity & Momentum)
  - `12:30 PM` (Afternoon — Resilience & Patience)
  - `5:30 PM` (Evening — Twilight Reflection)
  - `8:00 PM` (Night — Introspection & Stoicism)
  - `2:00 AM` (Late Night — Solitude & Existentialism)
- Interactive 24-hour slider.
- One-click reset to live real-time clock.

---

### 🗄️ Database Architecture (Supabase + Local Seed Fallback)
- **Supabase PostgreSQL Support**: Includes full schema, Row Level Security (RLS) policies, GIN indexes, and initial migrations in `supabase/schema.sql`.
- **Offline / Zero-Config Fallback**: Works 100% out of the box using verified local seed data even without internet access or Supabase credentials.

---

## 3. Technology Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Testing**: Vitest
- **Database Client**: `@supabase/supabase-js`

---

## 4. Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# 1. Clone or open repository
cd QuoteMe.

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 5. Running Tests

To run the automated test suite for timezone conversions, time slot mapping, and recommendation relaxation:

```bash
npm test
```

---

## 6. Supabase Database Configuration (Optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. Copy your project URL and anonymous key.
5. Create a `.env` file in the root folder based on `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

When configured, the app will automatically fetch quotes from Supabase while maintaining the offline fallback.

---

## 7. Hugging Face Dataset Integration (`jstet/quotes-500k`)

ChronoQuotes includes an ETL ingestion pipeline in [`scripts/import_quotes_500k.py`](./scripts/import_quotes_500k.py) designed specifically for the **`jstet/quotes-500k`** dataset from Hugging Face.

### How it works:
1. **Extraction**: Loads quotes either via the Hugging Face `datasets` library (`from datasets import load_dataset; ds = load_dataset("jstet/quotes-500k")`) or streams directly from the repository's raw CSV without external dependencies.
2. **Intelligent Genre Classification**: Maps the raw tags and textual themes into ChronoQuotes' **18 curated genres** (Stoicism, Bhagavad Gita, Dark Academia, Psychology, Existentialism, etc.).
3. **Circadian Scheduling**: Assigns quotes to appropriate **IST time slots** (`early_morning`, `morning`, `afternoon`, `evening`, `night`, `late_night`).
4. **Attribution Separation**: Splits author names from attached book or publication titles into clean citations.
5. **Dual Export**:
   - Generates [`src/data/huggingfaceQuotes.json`](./src/data/huggingfaceQuotes.json) for offline in-app discovery.
   - Generates [`supabase/quotes_500k_batch.sql`](./supabase/quotes_500k_batch.sql) for 1-click batch ingestion into your Supabase PostgreSQL database.

### Running the Importer:

```bash
# Option A: Direct stream (zero pip dependencies)
python3 scripts/import_quotes_500k.py --limit 500

# Option B: Using the Hugging Face datasets library
pip install datasets
python3 scripts/import_quotes_500k.py --use-datasets --limit 1000
```

---

## 8. Kaggle Dataset Integration (`dev122/love-quotes` via `kagglehub`)

ChronoQuotes includes native support for loading love, affection, and relationship quotes using **`kagglehub`** with the **`KaggleDatasetAdapter.HUGGING_FACE`** adapter in [`scripts/import_love_quotes.py`](./scripts/import_love_quotes.py).

### Usage with `kagglehub`:

```python
# Install dependencies as needed:
# pip install kagglehub[hf-datasets]
import kagglehub
from kagglehub import KaggleDatasetAdapter

# Set the path to the file you'd like to load
file_path = "Quotes.csv"

# Load the latest version
hf_dataset = kagglehub.load_dataset(
  KaggleDatasetAdapter.HUGGING_FACE,
  "dev122/love-quotes",
  file_path,
)

print("Hugging Face Dataset:", hf_dataset)
```

### Running the Love Quotes Pipeline:

```bash
# Ingest quotes directly into ChronoQuotes
python3 scripts/import_love_quotes.py --limit 200
```

This maps romantic, relationship, and affection reflections into:
- **Genres**: *Love & Relationships*, *Self-Respect & Boundaries*, *Philosophy*, *Mindfulness*
- **Circadian Slots**: *Twilight Reflection* (Evening, 4:00 PM – 7:00 PM) & *Midnight Solitude* (Late Night, 11:00 PM – 5:00 AM)
- **Output files**: [`src/data/loveQuotes.json`](./src/data/loveQuotes.json) and [`supabase/love_quotes_batch.sql`](./supabase/love_quotes_batch.sql)

# QuoteMe
# QuoteMe
