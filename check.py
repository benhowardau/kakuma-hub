#!/usr/bin/env python3
"""Checks the site before you publish. Run: python3 check.py
Reads every data file, every page and every link, and says what is wrong. No installs needed."""
import json, re, sys, os, urllib.request
here = os.path.dirname(os.path.abspath(__file__))
ok = True
def fail(msg):
    global ok; ok = False; print("PROBLEM:", msg)

# 1. data files are valid JSON with the fields the pages expect
need = {
    "members.json": ["name", "role", "skills", "about", "work", "lightning", "contact", "location", "photo"],
    "products.json": ["name", "maker", "origin", "price_sats", "about", "photo", "lightning", "contact"],
    "events.json": ["date", "time", "title", "where", "note"],
}
for f, fields in need.items():
    p = os.path.join(here, "data", f)
    try:
        rows = json.load(open(p, encoding="utf-8"))
    except Exception as e:
        fail(f"data/{f} is not valid JSON: {e}. Look for a missing comma or quote near the line it names."); continue
    if not isinstance(rows, list): fail(f"data/{f} must be a list: it starts with [ and ends with ]"); continue
    for i, r in enumerate(rows, 1):
        for k in fields:
            if k not in r: fail(f"data/{f} entry {i} ({r.get('name', '?')}) is missing \"{k}\"")
        if f == "events.json" and not re.match(r"^\d{4}-\d{2}-\d{2}$", str(r.get("date", ""))):
            fail(f"data/events.json entry {i} date must look like 2026-10-31")
        if f == "products.json" and not isinstance(r.get("price_sats"), int):
            fail(f"data/products.json entry {i} price_sats must be a whole number without quotes")
        if f == "members.json" and not isinstance(r.get("skills"), list):
            fail(f"data/members.json entry {i} skills must be a list like [\"Teaching\", \"Design\"]")
    print(f"data/{f}: {len(rows)} entries, fields present")

# 2. every page links only to files that exist
pages = [f for f in os.listdir(here) if f.endswith(".html")]
for pg in pages:
    html = open(os.path.join(here, pg), encoding="utf-8").read()
    for href in re.findall(r'(?:href|src)="([^"#]+)', html):
        if href.startswith(("http", "mailto:", "data:")): continue
        if not os.path.exists(os.path.join(here, href)): fail(f"{pg} links to {href}, which does not exist")
print(f"{len(pages)} pages, local links resolve")

# 3. the external links answer (needs internet; skip with --offline)
if "--offline" not in sys.argv:
    seen = set()
    for pg in pages + ["course.js"]:
        for url in re.findall(r'https?://[^\s"\'<>)]+', open(os.path.join(here, pg), encoding="utf-8").read()):
            if url in seen or "example.com" in url or "wa.me" in url or "w3.org" in url: continue
            seen.add(url)
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}, method="HEAD")
                urllib.request.urlopen(req, timeout=15)
            except Exception as e:
                code = getattr(e, "code", None)
                if code in (403, 405, 429): continue  # the site is there, it just refuses robots
                fail(f"{url} did not answer ({e}). Check it in a browser; fix or remove the link in {pg}.")
    print(f"{len(seen)} external links checked")

print("ALL GOOD" if ok else "Fix the problems above, then run this again.")
sys.exit(0 if ok else 1)
