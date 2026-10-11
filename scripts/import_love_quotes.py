#!/usr/bin/env python3
"""
ETL Pipeline & Ingestion Script for Kaggle `dev122/love-quotes`
ChronoQuotes — Time-Based Quote Discovery Platform

Integrates:
    import kagglehub
    from kagglehub import KaggleDatasetAdapter
    hf_dataset = kagglehub.load_dataset(
        KaggleDatasetAdapter.HUGGING_FACE,
        "dev122/love-quotes",
        "Quotes.csv"
    )

Maps and enriches love, relationship, and reflection quotes into:
  - ChronoQuotes 18 genres ('Love & Relationships', 'Philosophy', 'Life Lessons', etc.)
  - Circadian time slots ('evening', 'night', 'late_night', 'afternoon')
  - Outputs to `src/data/loveQuotes.json` and `supabase/love_quotes_batch.sql`
"""

import os
import sys
import csv
import json
import ast
import argparse
from typing import List, Dict, Tuple, Optional

# Official ChronoQuotes genres
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


def classify_love_quote(tags_raw: str, text: str, author: str) -> Tuple[List[str], List[str]]:
    """Determine genres and circadian time slots for love quotes."""
    genres = set(['Love & Relationships'])
    text_lower = text.lower()
    author_lower = author.lower()
    
    # Parse tags safely
    tag_list = []
    if isinstance(tags_raw, str):
        try:
            if tags_raw.startswith('[') and tags_raw.endswith(']'):
                tag_list = ast.literal_eval(tags_raw)
            else:
                tag_list = [t.strip() for t in tags_raw.split(',') if t.strip()]
        except:
            tag_list = [t.strip() for t in tags_raw.split(',') if t.strip()]
    elif isinstance(tags_raw, list):
        tag_list = tags_raw

    tags_lower = [str(t).lower() for t in tag_list]

    # Keyword rules
    if any(k in tags_lower for k in ['philosophy', 'truth', 'wisdom', 'knowledge']) or 'soul' in text_lower:
        genres.add('Philosophy')
    if any(k in tags_lower for k in ['books', 'reading', 'poetry', 'literature']) or any(a in author_lower for a in ['wilde', 'cicero', 'neruda', 'plath']):
        genres.add('Dark Academia')
    if any(k in tags_lower for k in ['be-yourself', 'honesty', 'self-respect', 'boundaries']) or 'respect' in text_lower:
        genres.add('Self-Respect & Boundaries')
    if any(k in tags_lower for k in ['inspirational', 'courage', 'hope']):
        genres.add('Motivation')
    if any(k in tags_lower for k in ['life', 'mistakes', 'age', 'time']):
        genres.add('Life Lessons')
    if any(k in tags_lower for k in ['humor', 'art', 'music', 'dance']):
        genres.add('Creativity')
    if any(k in tags_lower for k in ['peace', 'serenity', 'mindfulness', 'calm']):
        genres.add('Mindfulness')

    genre_result = sorted(list(genres))[:3]

    # Circadian slot assignment: Love & Relationships shines in Evening & Late Night
    slots = set(['evening'])
    if 'Dark Academia' in genre_result or 'Philosophy' in genre_result or len(text) > 120:
        slots.add('late_night')
    if 'Self-Respect & Boundaries' in genre_result or 'Mindfulness' in genre_result:
        slots.add('afternoon')
    if 'Philosophy' in genre_result:
        slots.add('night')

    return genre_result, sorted(list(slots))


def load_love_quotes(limit: int = 200):
    print(f"[*] Starting Kaggle love-quotes ETL for 'dev122/love-quotes'...")
    
    quotes_data = []

    # 1. Attempt loading via kagglehub KaggleDatasetAdapter (User snippet pattern)
    try:
        import kagglehub
        from kagglehub import KaggleDatasetAdapter

        print("[+] Attempting load via kagglehub.load_dataset(KaggleDatasetAdapter.HUGGING_FACE, 'dev122/love-quotes', 'Quotes.csv')...")
        file_path = "Quotes.csv"
        
        try:
            hf_dataset = kagglehub.load_dataset(
                KaggleDatasetAdapter.HUGGING_FACE,
                "dev122/love-quotes",
                file_path,
            )
            print(f"[+] Loaded Hugging Face dataset object: {type(hf_dataset)}")
            
            for i, row in enumerate(hf_dataset):
                if len(quotes_data) >= limit:
                    break
                quote_text = (row.get('Quotes') or row.get('quote') or '').strip().strip('“"”\'')
                author = (row.get('Author') or row.get('author') or 'Unknown').strip()
                tags = row.get('Tags') or row.get('category') or ''

                if not quote_text or len(quote_text) < 15:
                    continue

                genres, slots = classify_love_quote(tags, quote_text, author)
                quotes_data.append({
                    'id': f'love-{i+1:04d}',
                    'text': quote_text,
                    'author': author,
                    'genres': genres,
                    'timeCategories': slots,
                    'source': 'Love Quotes Collection',
                    'language': 'en',
                    'isVerified': True,
                    'createdAt': '2026-03-01T00:00:00Z'
                })
        except Exception as adapter_err:
            print(f"[-] Adapter load failed: {adapter_err}. Falling back to kagglehub.dataset_download()...")
            downloaded_dir = kagglehub.dataset_download("dev122/love-quotes")
            csv_path = os.path.join(downloaded_dir, "Quotes.csv")
            print(f"[+] Reading downloaded CSV: {csv_path}...")
            
            with open(csv_path, encoding='utf-8', errors='ignore') as f:
                reader = csv.DictReader(f)
                for i, row in enumerate(reader):
                    if len(quotes_data) >= limit:
                        break
                    quote_text = (row.get('Quotes') or row.get('quote') or '').strip().strip('“"”\'')
                    author = (row.get('Author') or row.get('author') or 'Unknown').strip()
                    tags = row.get('Tags') or row.get('category') or ''

                    if not quote_text or len(quote_text) < 15:
                        continue

                    genres, slots = classify_love_quote(tags, quote_text, author)
                    quotes_data.append({
                        'id': f'love-{i+1:04d}',
                        'text': quote_text,
                        'author': author,
                        'genres': genres,
                        'timeCategories': slots,
                        'source': 'Love Quotes Collection',
                        'language': 'en',
                        'isVerified': True,
                        'createdAt': '2026-03-01T00:00:00Z'
                    })

    except Exception as e:
        print(f"[-] Kagglehub processing error: {e}")

    print(f"[+] Successfully extracted {len(quotes_data)} love & relationship quotes.")

    # Export to JSON
    output_json = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'loveQuotes.json')
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(quotes_data, f, indent=2, ensure_ascii=False)
    print(f"[+] Saved JSON output to: {output_json}")

    # Export to Supabase SQL Batch
    output_sql = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'love_quotes_batch.sql')
    with open(output_sql, 'w', encoding='utf-8') as f:
        f.write("-- Batch seed from Kaggle dev122/love-quotes for ChronoQuotes\n")
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
    print(f"[+] Saved Supabase SQL seed to: {output_sql}")
    print("[✓] dev122/love-quotes ETL finished successfully!")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Import quotes from Kaggle dev122/love-quotes")
    parser.add_argument('--limit', type=int, default=200, help="Max quotes to import")
    args = parser.parse_args()

    load_love_quotes(limit=args.limit)
