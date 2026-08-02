"""
Generate a fine-tuning dataset for converting diary-style spending entries
into structured JSON: {title, amount, type, category}

Strategy:
1. Generate ground-truth JSON labels first (deterministic, no labeling errors).
2. Generate diary-style text from each label using randomized templates.
3. Write out train/val/test JSONL files with raw text and JSON labels.

Usage:
    python generateDataset.py --n 3000 --out data/
"""

import json
import random
import argparse
from pathlib import Path

random.seed(42)

# ---------------------------------------------------------------------------
# 1. Domain data: categories, vendors, items, amount ranges
# ---------------------------------------------------------------------------

CATEGORIES = {
    "Food": {
        "items": ["lunch", "coffee", "groceries", "pizza", "dinner", "snacks", "breakfast"],
        "vendors": ["Starbucks", "McDonald's", "the local diner", "Whole Foods", "Domino's", "the cafe"],
        "amount_range": (150, 4000),
    },
    "Transport": {
        "items": ["uber ride", "gas", "train ticket", "bus pass", "parking", "taxi"],
        "vendors": ["Uber", "Shell", "the metro station", "Lyft", "the parking garage"],
        "amount_range": (100, 5000),
    },
    "Entertainment": {
        "items": ["movie ticket", "Netflix subscription", "concert ticket", "video game", "Spotify subscription"],
        "vendors": ["AMC", "Netflix", "Ticketmaster", "Steam", "Spotify"],
        "amount_range": (200, 8000),
    },
    "Shopping": {
        "items": ["new shoes", "a jacket", "headphones", "a book", "phone case"],
        "vendors": ["Amazon", "Target", "the mall", "Nike store", "Best Buy"],
        "amount_range": (500, 20000),
    },
    "Bills": {
        "items": ["electricity bill", "internet bill", "phone bill", "rent", "water bill"],
        "vendors": ["the power company", "Comcast", "Verizon", "the landlord"],
        "amount_range": (1000, 80000),
    },
    "Health": {
        "items": ["doctor visit", "gym membership", "medicine", "dental checkup"],
        "vendors": ["the pharmacy", "the clinic", "Planet Fitness", "CVS"],
        "amount_range": (500, 25000),
    },
    "Subscriptions": {
        "items": ["Netflix subscription", "gym membership", "cloud storage plan", "magazine subscription"],
        "vendors": ["Netflix", "iCloud", "Planet Fitness", "Spotify"],
        "amount_range": (199, 3999),
    },
}

INCOME_SOURCES = {
    "items": ["salary", "freelance payment", "cashback reward", "gift money", "refund"],
    "vendors": ["my employer", "a client", "the bank", "grandma", "the store"],
    "amount_range": (5000, 250000),
}

# ---------------------------------------------------------------------------
# 2. Diary text templates (expense)
# ---------------------------------------------------------------------------

EXPENSE_TEMPLATES = [
    "Spent Rs. {amount} on {item} at {vendor} today.",
    "Paid Rs. {amount} for {item}.",
    "Got {item} from {vendor}, cost me Rs. {amount}.",
    "{vendor} charged me Rs. {amount} for {item}.",
    "Bought {item} today, it was Rs. {amount}.",
    "Dropped Rs. {amount} on {item} at {vendor}.",
    "Today I paid Rs. {amount} for my {item}.",
    "Grabbed {item} at {vendor} — Rs. {amount} gone.",
    "Rs. {amount} for {item}, ouch.",
    "Renewed my {item}, Rs. {amount} charged by {vendor}.",
    "Spent ₹{amount} on {item} at {vendor} today.",
    "Paid ₹{amount} for {item}.",
    "Got {item} from {vendor}, cost me ₹{amount}.",
    "{vendor} charged me ₹{amount} for {item}.",
    "Bought {item} today, it was ₹{amount}.",
    "Dropped ₹{amount} on {item} at {vendor}.",
    "Today I paid ₹{amount} for my {item}.",
    "Grabbed {item} at {vendor} — ₹{amount} gone.",
    "₹{amount} for {item}, ouch.",
    "Renewed my {item}, ₹{amount} charged by {vendor}.",
]

INCOME_TEMPLATES = [
    "Got paid Rs. {amount} today from {vendor}.",
    "Received Rs. {amount} as {item}.",
    "{vendor} sent me Rs. {amount}.",
    "Made Rs. {amount} from {item}.",
    "Deposited Rs. {amount} — {item} from {vendor}.",
    "Got paid ₹{amount} today from {vendor}.",
    "Received ₹{amount} as {item}.",
    "{vendor} sent me ₹{amount}.",
    "Made ₹{amount} from {item}.",
    "Deposited ₹{amount} — {item} from {vendor}.",
]

# ---------------------------------------------------------------------------
# 3. Generation logic
# ---------------------------------------------------------------------------

def make_title(item: str) -> str:
    """Turn a raw item phrase into a clean title, e.g. 'Netflix subscription' -> 'Subscription: Netflix'."""
    if "subscription" in item.lower():
        brand = item.split(" subscription")[0].strip().title()
        return f"Subscription: {brand}" if brand.lower() != "subscription" else "Subscription"
    return item.title()


def gen_expense_record():
    category = random.choice(list(CATEGORIES.keys()))
    data = CATEGORIES[category]
    item = random.choice(data["items"])
    vendor = random.choice(data["vendors"])
    lo, hi = data["amount_range"]
    amount = round(random.uniform(lo, hi), 2)
    if amount == int(amount):
        amount = int(amount)

    label = {
        "title": make_title(item),
        "amount": amount,
        "type": "expense",
        "category": category,
    }
    text = random.choice(EXPENSE_TEMPLATES).format(amount=amount, item=item, vendor=vendor)
    return text, label


def gen_income_record():
    item = random.choice(INCOME_SOURCES["items"])
    vendor = random.choice(INCOME_SOURCES["vendors"])
    lo, hi = INCOME_SOURCES["amount_range"]
    amount = round(random.uniform(lo, hi), 2)
    if amount == int(amount):
        amount = int(amount)

    label = {
        "title": make_title(item),
        "amount": amount,
        "type": "income",
        "category": "Income",
    }
    text = random.choice(INCOME_TEMPLATES).format(amount=amount, item=item, vendor=vendor)
    return text, label


def generate_raw_dataset(n: int, income_ratio: float = 0.15):
    records = []
    for _ in range(n):
        if random.random() < income_ratio:
            text, label = gen_income_record()
        else:
            text, label = gen_expense_record()
        records.append({"text": text, "label": label})
    return records


def write_jsonl(path: Path, records):
    with open(path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=3000, help="total number of examples")
    parser.add_argument("--out", type=str, default="data", help="output directory")
    args = parser.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Generating {args.n} raw records...")
    records = generate_raw_dataset(args.n)

    # Deduplicate exact text collisions (can happen with small template pools)
    seen = set()
    unique_records = []
    for r in records:
        if r["text"] not in seen:
            seen.add(r["text"])
            unique_records.append(r)
    records = unique_records
    print(f"{len(records)} unique records after dedup.")

    random.shuffle(records)

    n = len(records)
    train_end = int(n * 0.85)
    val_end = int(n * 0.95)

    train, val, test = records[:train_end], records[train_end:val_end], records[val_end:]

    write_jsonl(out_dir / "train.jsonl", train)
    write_jsonl(out_dir / "val.jsonl", val)
    write_jsonl(out_dir / "test.jsonl", test)

    print(f"Done. train={len(train)} val={len(val)} test={len(test)}")
    print(f"Files written to {out_dir}/")


if __name__ == "__main__":
    main()
