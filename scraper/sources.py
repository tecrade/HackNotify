"""
List of hackathon listing/detail pages to scrape.

HOW TO ADD A NEW SOURCE
------------------------
Just append a URL string to SOURCE_URLS below. That's it.
You do NOT need to write a custom parser for each site - the AI pipeline
(see ai_extract.py) reads the page's visible text and pulls out structured
fields itself, so it keeps working even if the site's HTML/CSS changes.

Each entry can be either:
  - a single hackathon detail page (best accuracy), or
  - a listing/index page containing several hackathons (the AI will try to
    extract every hackathon it can find on that page)

Tips for good extraction:
  - Prefer the specific "event details" page over a generic homepage.
  - Devfolio/Unstop/HackerEarth event pages work well because they contain
    most fields (dates, prizes, mode, team size) in visible text.
"""

SOURCE_URLS = [
    "https://devfolio.co/hackathons",
    "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page=1&per_page=50&oppstatus=open&sortBy=&orderBy=&filter_condition=&sort=prize&dir=desc&sort=prize&dir=desc&undefined=true",
    "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page=2&per_page=50&oppstatus=open&sortBy=&orderBy=&filter_condition=&sort=prize&dir=desc&sort=prize&dir=desc&undefined=true",
    "https://devpost.com/api/hackathons?challenge_type%5B%5D=online&status%5B%5D=open&per_page=50",
    "https://www.knowafest.com/explore/category/Hackathons_in_Kerala?page=1",
    "https://topkerala.in/events"
]
