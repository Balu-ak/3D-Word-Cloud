import math
import re
from dataclasses import dataclass
from html.parser import HTMLParser
from urllib.parse import urlparse

import trafilatura
from newspaper import Article


@dataclass
class ArticleContent:
    title: str
    text: str
    source_url: str
    source_domain: str
    estimated_reading_time_minutes: int


class ArticleExtractionError(Exception):
    """Raised when article extraction fails or returns insufficient content."""


MINIMUM_ARTICLE_WORD_COUNT = 50


def extract_article(url: str) -> ArticleContent:
    source_domain = _extract_source_domain(url)
    newspaper_title = ""
    newspaper_text = ""
    fallback_text = ""

    try:
        newspaper_title, newspaper_text = _extract_with_newspaper(url)
        if _is_sufficient_article(newspaper_text):
            return ArticleContent(
                title=newspaper_title,
                text=newspaper_text,
                source_url=url,
                source_domain=source_domain,
                estimated_reading_time_minutes=_estimate_reading_time_minutes(
                    newspaper_text
                ),
            )
    except Exception:
        newspaper_title = ""
        newspaper_text = ""

    try:
        fallback_title, fallback_text = _extract_with_trafilatura(url)
        if _is_sufficient_article(fallback_text):
            return ArticleContent(
                title=fallback_title or newspaper_title,
                text=fallback_text,
                source_url=url,
                source_domain=source_domain,
                estimated_reading_time_minutes=_estimate_reading_time_minutes(
                    fallback_text
                ),
            )
    except Exception as exc:
        raise ArticleExtractionError(
            "Could not extract article content from the provided URL."
        ) from exc

    if max(_count_words(newspaper_text), _count_words(fallback_text)) > 0:
        raise ArticleExtractionError(
            "Extracted article text was too short to analyze reliably."
        )

    raise ArticleExtractionError(
        "Could not extract article content from the provided URL."
    )


def _extract_with_newspaper(url: str) -> tuple[str, str]:
    article = Article(url)
    article.download()
    article.parse()
    return article.title.strip(), _normalize_whitespace(article.text)


def _extract_with_trafilatura(url: str) -> tuple[str, str]:
    downloaded_html = trafilatura.fetch_url(url)
    if not downloaded_html:
        raise ArticleExtractionError(
            "Could not download article HTML for fallback extraction."
        )

    extracted_text = trafilatura.extract(
        downloaded_html,
        include_comments=False,
        include_tables=False,
        output_format="txt",
        url=url,
    )
    if not extracted_text:
        raise ArticleExtractionError(
            "Fallback extractor could not find article text."
        )

    return _extract_html_title(downloaded_html), _normalize_whitespace(extracted_text)


def _extract_html_title(html: str) -> str:
    parser = _TitleParser()
    parser.feed(html)
    return parser.title


def _extract_source_domain(url: str) -> str:
    return urlparse(url).netloc.removeprefix("www.")


def _normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _estimate_reading_time_minutes(text: str) -> int:
    word_count = _count_words(text)
    if word_count == 0:
        return 0
    return max(1, math.ceil(word_count / 200))


def _count_words(text: str) -> int:
    return len(text.split())


def _is_sufficient_article(text: str) -> bool:
    return _count_words(text) >= MINIMUM_ARTICLE_WORD_COUNT


class _TitleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._inside_title = False
        self._title_parts: list[str] = []

    @property
    def title(self) -> str:
        return "".join(self._title_parts).strip()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() == "title":
            self._inside_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self._inside_title = False

    def handle_data(self, data: str) -> None:
        if self._inside_title:
            self._title_parts.append(data)
