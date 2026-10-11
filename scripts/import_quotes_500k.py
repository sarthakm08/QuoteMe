#!/usr/bin/env python3
"""
ETL Pipeline & Ingestion Script for Hugging Face `jstet/quotes-500k`
ChronoQuotes — Time-Based Quote Discovery Platform

This script extracts quotes from the `jstet/quotes-500k` dataset,
intelligently maps their categories to ChronoQuotes' 18 genres and 6 circadian
time slots, cleans author/source attributions, and exports them to:
  1. JSON format for frontend local offline usage (src/data/huggingfaceQuotes.json)
  2. SQL format for Supabase database batch seeding (supabase/quotes_500k_batch.sql)

Usage:
    # Mode A: If 'datasets' library is installed:
    python3 scripts/import_quotes_500k.py --use-datasets --limit 1000

    # Mode B: Direct stream from Hugging Face CSV (zero dependencies):
    python3 scripts/import_quotes_500k.py --stream --limit 500
"""

import sys
import os
import re
import csv
import json
import argparse
import urllib.request
from typing import List, Dict, Tuple, Optional

# The 18 official ChronoQuotes genres
GENRES = [
    'Motivation',
    'Discipline & Consistency',
    'Stoicism',
    'Philosophy',
    'Love & Relationships',
    'Self-Respect & Boundaries',
    'Success & Ambition',
    'Psychology',
    'Mindfulness',
    'Confidence',
    'Existentialism',
    'Creativity',
    'Leadership',
    'Life Lessons',
    'Dark Academia',
    'Spirituality',
    'Bhagavad Gita & Indian Wisdom',
    'Minimalism'
]

# The 6 circadian time slots
TIME_SLOTS = [
    'early_morning',
    'morning',
    'afternoon',
    'evening',
    'night',
    'late_night'
]

# Mapping rules: keywords/tags -> Genres
GENRE_TAG_RULES = {
    'Motivation': ['motivation', 'inspirational', 'inspire', 'courage', 'strength', 'determination', 'hope', 'perseverance', 'ambition', 'will'],
    'Discipline & Consistency': ['discipline', 'habits', 'habit', 'consistency', 'work', 'hard-work', 'effort', 'routine', 'practice', 'focus', 'persistence'],
    'Stoicism': ['stoic', 'stoicism', 'marcus-aurelius', 'seneca', 'epictetus', 'adversity', 'acceptance', 'fate', 'control', 'endurance'],
    'Philosophy': ['philosophy', 'philosophical', 'truth', 'wisdom', 'reason', 'logic', 'meaning', 'knowledge', 'ethics', 'virtue', 'socrates', 'plato', 'aristotle', 'nietzsche'],
    'Love & Relationships': ['love', 'relationships', 'relationship', 'friendship', 'friend', 'heart', 'marriage', 'compassion', 'romance', 'lovers', 'kindness'],
    'Self-Respect & Boundaries': ['self-respect', 'boundaries', 'dignity', 'respect', 'self-worth', 'integrity', 'authenticity', 'individuality', 'independence'],
    'Success & Ambition': ['success', 'ambition', 'goals', 'achievement', 'leadership', 'victory', 'excellence', 'wealth', 'greatness', 'action'],
    'Psychology': ['psychology', 'mind', 'human-nature', 'emotions', 'behavior', 'psyche', 'thoughts', 'subconscious', 'jung', 'freud', 'perception'],
    'Mindfulness': ['mindfulness', 'peace', 'calm', 'serenity', 'present-moment', 'silence', 'stillness', 'breath', 'awareness', 'zen', 'meditation'],
    'Confidence': ['confidence', 'self-esteem', 'fearless', 'bravery', 'pride', 'belief', 'self-confidence', 'boldness', 'power'],
    'Existentialism': ['existentialism', 'existential', 'camus', 'sartre', 'dostoevsky', 'absurd', 'freedom', 'despair', 'solitude', 'meaning-of-life', 'kafka'],
    'Creativity': ['creativity', 'creative', 'art', 'artist', 'imagination', 'writing', 'poetry', 'music', 'inspiration', 'beauty', 'literature'],
    'Leadership': ['leadership', 'leader', 'vision', 'guidance', 'responsibility', 'influence', 'team', 'service', 'courage-to-lead'],
    'Life Lessons': ['life', 'life-lessons', 'experience', 'growth', 'change', 'learning', 'mistakes', 'regret', 'time', 'mortality', 'age'],
    'Dark Academia': ['dark-academia', 'books', 'reading', 'classics', 'poetry', 'melancholy', 'literature', 'library', 'solitude', 'mystery', 'wilde', 'poe'],
    'Spirituality': ['spirituality', 'spiritual', 'soul', 'god', 'divine', 'faith', 'transcendence', 'enlightenment', 'universe', 'inner-peace', 'rumi'],
    'Bhagavad Gita & Indian Wisdom': ['gita', 'bhagavad-gita', 'krishna', 'karma', 'dharma', 'yoga', 'vedanta', 'upanishad', 'vivekananda', 'tagore', 'buddha', 'hinduism'],
    'Minimalism': ['simplicity', 'minimalism', 'simple', 'essential', 'declutter', 'contentment', 'restraint', 'peaceful']
}

# Mapping rules: genres/moods -> Time Slots
SLOT_GENRE_AFFINITY = {
    'early_morning': ['Discipline & Consistency', 'Motivation', 'Success & Ambition', 'Mindfulness'],
    'morning': ['Productivity', 'Success & Ambition', 'Confidence', 'Creativity', 'Leadership', 'Motivation'],
    'afternoon': ['Discipline & Consistency', 'Mindfulness', 'Life Lessons', 'Confidence', 'Minimalism'],
    'evening': ['Love & Relationships', 'Spirituality', 'Mindfulness', 'Life Lessons', 'Creativity'],
    'night': ['Philosophy', 'Stoicism', 'Psychology', 'Self-Respect & Boundaries', 'Bhagavad Gita & Indian Wisdom'],
    'late_night': ['Existentialism', 'Dark Academia', 'Spirituality', 'Philosophy', 'Creativity']
}


def map_categories_to_genres(raw_tags_str: str, quote_text: str, author_name: str) -> List[str]:
    """Map comma-separated tags and text analysis to ChronoQuotes genres."""
    assigned = set()
    tags = [t.strip().lower() for t in raw_tags_str.split(',') if t.strip()]
    text_lower = quote_text.lower()
    author_lower = author_name.lower()

    # Match based on tag keywords
    for genre, keywords in GENRE_TAG_RULES.items():
        for kw in keywords:
            if any(kw == tag or kw in tag for tag in tags):
                assigned.add(genre)
                break
            if kw in author_lower or kw in text_lower:
                assigned.add(genre)
                break

    # Famous author special priors
    if any(a in author_lower for a in ['aurelius', 'seneca', 'epictetus', 'zeno']):
        assigned.add('Stoicism')
        assigned.add('Philosophy')
    if any(a in author_lower for a in ['krishna', 'gita', 'vivekananda', 'tagore', 'radhakrishnan', 'buddha', 'shankara']):
        assigned.add('Bhagavad Gita & Indian Wisdom')
        assigned.add('Spirituality')
    if any(a in author_lower for a in ['camus', 'sartre', 'nietzsche', 'dostoevsky', 'kafka', 'kierkegaard']):
        assigned.add('Existentialism')
        assigned.add('Philosophy')
    if any(a in author_lower for a in ['wilde', 'woolf', 'poe', 'fitzgerald', 'keats', 'byron']):
        assigned.add('Dark Academia')
        assigned.add('Creativity')
    if any(a in author_lower for a in ['jung', 'freud', 'frankl', 'adler']):
        assigned.add('Psychology')
    if any(a in author_lower for a in ['rumi', 'hafez', 'gibran']):
        assigned.add('Spirituality')
        assigned.add('Love & Relationships')
    if any(a in author_lower for a in ['thoreau', 'emerson']):
        assigned.add('Minimalism')
        assigned.add('Philosophy')

    # If still unassigned, assign default Life Lessons or Philosophy
    if not assigned:
        if 'love' in text_lower:
            assigned.add('Love & Relationships')
        elif 'life' in text_lower:
            assigned.add('Life Lessons')
        else:
            assigned.add('Philosophy')

    return sorted(list(assigned))[:3]


def determine_time_categories(genres: List[str]) -> List[str]:
    """Determine relevant circadian time slots based on genres."""
    slots = set()
    for slot, affinities in SLOT_GENRE_AFFINITY.items():
        for g in genres:
            if g in affinities:
                slots.add(slot)

    # If unmapped, give morning & night default balance
    if not slots:
        slots.add('morning')
        slots.add('evening')

    return sorted(list(slots))


def clean_quote_and_author(raw_text: str, raw_author: str) -> Tuple[str, str, Optional[str]]:
    """Clean quote quotation marks, and split author / book source."""
    text = raw_text.strip().strip('“"”\'')
    author_str = raw_author.strip()

    source = None
    # If author field contains comma followed by a work title: e.g. "Seneca, Letters from a Stoic"
    if ',' in author_str:
        parts = [p.strip() for p in author_str.split(',', 1)]
        author = parts[0]
        source = parts[1]
    else:
        author = author_str

    if not author:
        author = 'Unknown Sage'

    return text, author, source


def process_dataset(limit: int = 500, use_datasets: bool = False, stream: bool = True):
    print(f"[*] Starting ChronoQuotes ETL for 'jstet/quotes-500k' (Target: {limit} curated quotes)...")

    quotes_data = []

    if use_datasets:
        try:
            from datasets import load_dataset
            print("[+] Loading dataset via Hugging Face `datasets` library...")
            ds = load_dataset("jstet/quotes-500k", split="train")
            print(f"[+] Loaded dataset successfully with {len(ds)} raw items.")

            for i, item in enumerate(ds):
                if len(quotes_data) >= limit:
                    break
                quote_text = item.get('quote', '')
                author_raw = item.get('author', '')
                category_raw = item.get('category', '')
                
                # Quality filter
                if not quote_text or len(quote_text) < 25 or len(quote_text) > 350:
                    continue
                if not author_raw or author_raw.lower() in ['unknown', 'anonymous']:
                    continue

                text, author, source = clean_quote_and_author(quote_text, author_raw)
                genres = map_categories_to_genres(category_raw, text, author)
                time_categories = determine_time_categories(genres)

                quotes_data.append({
                    'id': f'hf-{i+1:05d}',
                    'text': text,
                    'author': author,
                    'genres': genres,
                    'timeCategories': time_categories,
                    'source': source,
                    'language': 'en',
                    'isVerified': True,
                    'createdAt': '2026-03-01T00:00:00Z'
                })
        except Exception as e:
            print(f"[-] Hugging Face `datasets` failed: {e}. Switching to direct streaming...")
            stream = True

    if stream and not quotes_data:
        csv_url = "https://huggingface.co/datasets/jstet/quotes-500k/resolve/main/quotes.csv"
        print(f"[+] Streaming directly from Hugging Face: {csv_url}...")
        req = urllib.request.Request(csv_url, headers={'User-Agent': 'Mozilla/5.0'})
        
        with urllib.request.urlopen(req) as response:
            import io
            # Stream line by line
            text_stream = io.TextIOWrapper(response, encoding='utf-8', errors='ignore')
            reader = csv.reader(text_stream)
            
            header = next(reader, None)
            idx = 0
            seen_texts = set()

            for row in reader:
                if len(quotes_data) >= limit:
                    break
                if len(row) < 2:
                    continue
                
                quote_text = row[0].strip()
                author_raw = row[1].strip()
                category_raw = row[2].strip() if len(row) > 2 else ''

                # Quality filtering
                if not quote_text or len(quote_text) < 20 or len(quote_text) > 350:
                    continue
                if quote_text in seen_texts:
                    continue
                seen_texts.add(quote_text)

                text, author, source = clean_quote_and_author(quote_text, author_raw)
                genres = map_categories_to_genres(category_raw, text, author)
                time_categories = determine_time_categories(genres)

                idx += 1
                quotes_data.append({
                    'id': f'hf-{idx:05d}',
                    'text': text,
                    'author': author,
                    'genres': genres,
                    'timeCategories': time_categories,
                    'source': source,
                    'language': 'en',
                    'isVerified': True,
                    'createdAt': '2026-03-01T00:00:00Z'
                })

                if idx % 100 == 0:
                    print(f"    -> Processed {idx} / {limit} quotes...")

    print(f"[+] Completed extraction: {len(quotes_data)} quotes categorized.")

    # 1. Save to JSON for the frontend
    output_json_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'huggingfaceQuotes.json')
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(quotes_data, f, indent=2, ensure_ascii=False)
    print(f"[+] Saved JSON dataset to: {output_json_path}")

    # 2. Save batch SQL for Supabase seeding
    output_sql_path = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'quotes_500k_batch.sql')
    with open(output_sql_path, 'w', encoding='utf-8') as f:
        f.write("-- Batch seed from Hugging Face `jstet/quotes-500k` for ChronoQuotes\n")
        f.write("INSERT INTO quotes (id, text, author, genres, time_categories, source, language, is_verified)\nVALUES\n")
        
        sql_rows = []
        for q in quotes_data:
            def escape(s: Optional[str]) -> str:
                if not s:
                    return 'NULL'
                return "'" + s.replace("'", "''") + "'"

            def array_sql(arr: List[str]) -> str:
                items = ["'" + x.replace("'", "''") + "'" for x in arr]
                return f"ARRAY[{', '.join(items)}]"

            sql_rows.append(
                f"({escape(q['id'])}, {escape(q['text'])}, {escape(q['author'])}, {array_sql(q['genres'])}, {array_sql(q['timeCategories'])}, {escape(q['source'])}, 'en', true)"
            )

        f.write(',\n'.join(sql_rows))
        f.write("\nON CONFLICT (id) DO NOTHING;\n")

    print(f"[+] Saved Supabase SQL batch seed to: {output_sql_path}")
    print("[✓] ETL Pipeline completed successfully!")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Import quotes from Hugging Face jstet/quotes-500k")
    parser.add_argument('--limit', type=int, default=500, help="Number of quotes to import (default: 500)")
    parser.add_argument('--use-datasets', action='store_true', help="Use Hugging Face 'datasets' library if installed")
    parser.add_argument('--stream', action='store_true', default=True, help="Stream directly from Hugging Face CSV")
    args = parser.parse_args()

    process_dataset(limit=args.limit, use_datasets=args.use_datasets, stream=args.stream)
