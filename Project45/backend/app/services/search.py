from typing import List, Dict, Optional, Any
from elasticsearch import Elasticsearch, exceptions as es_exceptions
from datetime import datetime

from ..config import settings
from ..models import Craft, CraftStep, Work


class SearchService:
    def __init__(self):
        self.es_url = settings.ELASTICSEARCH_URL
        self.index_name = settings.ELASTICSEARCH_INDEX
        self.client: Optional[Elasticsearch] = None
        self._connected = False

    def connect(self) -> bool:
        try:
            self.client = Elasticsearch(
                self.es_url,
                request_timeout=30,
                max_retries=3,
                retry_on_timeout=True
            )
            if self.client.ping():
                self._connected = True
                return True
            return False
        except Exception as e:
            print(f"Elasticsearch connection failed: {e}")
            self._connected = False
            return False

    def ensure_index(self) -> bool:
        if not self._connected and not self.connect():
            return False

        try:
            if not self.client.indices.exists(index=self.index_name):
                mappings = {
                    "mappings": {
                        "properties": {
                            "content_type": {"type": "keyword"},
                            "content_id": {"type": "integer"},
                            "title": {
                                "type": "text",
                                "analyzer": "ik_max_word",
                                "search_analyzer": "ik_smart",
                                "fields": {
                                    "suggest": {"type": "completion"}
                                }
                            },
                            "content": {
                                "type": "text",
                                "analyzer": "ik_max_word",
                                "search_analyzer": "ik_smart"
                            },
                            "tags": {
                                "type": "text",
                                "analyzer": "ik_max_word"
                            },
                            "category": {"type": "keyword"},
                            "difficulty_level": {"type": "keyword"},
                            "image_url": {"type": "keyword", "index": False},
                            "created_at": {"type": "date"},
                            "view_count": {"type": "integer"},
                            "rating": {"type": "float"}
                        }
                    },
                    "settings": {
                        "analysis": {
                            "analyzer": {
                                "ik_max_word": {
                                    "type": "custom",
                                    "tokenizer": "ik_max_word"
                                },
                                "ik_smart": {
                                    "type": "custom",
                                    "tokenizer": "ik_smart"
                                }
                            }
                        }
                    }
                }
                self.client.indices.create(index=self.index_name, body=mappings)
            return True
        except es_exceptions.RequestError as e:
            if "resource_already_exists_exception" in str(e):
                return True
            print(f"Index creation error: {e}")
            return False
        except Exception as e:
            print(f"Index error: {e}")
            return False

    def index_craft(self, craft: Craft) -> bool:
        if not self._connected and not self.connect():
            return False

        try:
            tags = []
            if craft.category:
                tags.append(craft.category.name)
            tags.append(craft.difficulty_level)

            content_parts = [craft.description or ""]
            for step in craft.steps:
                content_parts.append(step.title)
                content_parts.append(step.description or "")
                if step.tips:
                    content_parts.append(step.tips)

            doc = {
                "content_type": "craft",
                "content_id": craft.id,
                "title": craft.title,
                "content": " ".join(content_parts),
                "tags": ",".join(tags),
                "category": craft.category.name if craft.category else None,
                "difficulty_level": craft.difficulty_level,
                "image_url": craft.cover_image,
                "created_at": craft.created_at,
                "view_count": 0,
                "rating": 4.5
            }

            self.client.index(
                index=self.index_name,
                id=f"craft_{craft.id}",
                body=doc
            )
            return True
        except Exception as e:
            print(f"Index craft error: {e}")
            return False

    def index_work(self, work: Work) -> bool:
        if not self._connected and not self.connect():
            return False

        try:
            tags = []
            if work.craft:
                tags.append(work.craft.title)
                if work.craft.category:
                    tags.append(work.craft.category.name)

            doc = {
                "content_type": "work",
                "content_id": work.id,
                "title": work.title,
                "content": work.description or "",
                "tags": ",".join(tags),
                "category": work.craft.category.name if work.craft and work.craft.category else None,
                "difficulty_level": None,
                "image_url": work.image_url,
                "created_at": work.created_at,
                "view_count": 0,
                "rating": float(sum(c.rating for c in work.comments) / len(work.comments)) if work.comments else 4.5
            }

            self.client.index(
                index=self.index_name,
                id=f"work_{work.id}",
                body=doc
            )
            return True
        except Exception as e:
            print(f"Index work error: {e}")
            return False

    def search(
        self,
        query: str,
        content_type: Optional[str] = None,
        category: Optional[str] = None,
        difficulty_level: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        fallback_results = self._fallback_search(query, content_type, category, difficulty_level, page, page_size)

        if not self._connected and not self.connect():
            return fallback_results

        try:
            must_queries = []

            if query and query.strip():
                must_queries.append({
                    "multi_match": {
                        "query": query,
                        "fields": ["title^3", "content", "tags^2"],
                        "type": "best_fields",
                        "operator": "or",
                        "minimum_should_match": "70%"
                    }
                })

            filter_queries = []
            if content_type:
                filter_queries.append({"term": {"content_type": content_type}})
            if category:
                filter_queries.append({"term": {"category": category}})
            if difficulty_level:
                filter_queries.append({"term": {"difficulty_level": difficulty_level}})

            search_body = {
                "query": {
                    "bool": {
                        "must": must_queries if must_queries else [{"match_all": {}}],
                        "filter": filter_queries if filter_queries else []
                    }
                },
                "from": (page - 1) * page_size,
                "size": page_size,
                "sort": [
                    {"_score": {"order": "desc"}},
                    {"view_count": {"order": "desc"}}
                ],
                "highlight": {
                    "fields": {
                        "title": {},
                        "content": {"fragment_size": 150, "number_of_fragments": 3}
                    }
                }
            }

            response = self.client.search(index=self.index_name, body=search_body)

            results = []
            for hit in response["hits"]["hits"]:
                source = hit["_source"]
                highlight = hit.get("highlight", {})

                description = source.get("content", "")
                if "content" in highlight:
                    description = "...".join(highlight["content"])

                results.append({
                    "id": source["content_id"],
                    "type": source["content_type"],
                    "title": highlight.get("title", [source["title"]])[0],
                    "description": description,
                    "score": hit["_score"],
                    "image_url": source.get("image_url")
                })

            return {
                "total": response["hits"]["total"]["value"],
                "results": results,
                "query": query,
                "page": page,
                "page_size": page_size,
                "total_pages": (response["hits"]["total"]["value"] + page_size - 1) // page_size
            }

        except Exception as e:
            print(f"Search error: {e}, using fallback")
            return fallback_results

    def _fallback_search(
        self,
        query: str,
        content_type: Optional[str] = None,
        category: Optional[str] = None,
        difficulty_level: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        from ..database import SessionLocal
        db = SessionLocal()

        try:
            query_lower = query.lower() if query else ""

            craft_query = db.query(Craft)
            if query_lower:
                craft_query = craft_query.filter(
                    (Craft.title.contains(query)) |
                    (Craft.description.contains(query))
                )
            if difficulty_level:
                craft_query = craft_query.filter(Craft.difficulty_level == difficulty_level)

            work_query = db.query(Work)
            if query_lower:
                work_query = work_query.filter(
                    (Work.title.contains(query)) |
                    (Work.description.contains(query))
                )

            results = []
            crafts = [] if content_type == "work" else craft_query.all()
            works = [] if content_type == "craft" else work_query.all()

            for craft in crafts:
                score = 10.0 if query_lower and query_lower in craft.title.lower() else 5.0
                results.append({
                    "id": craft.id,
                    "type": "craft",
                    "title": craft.title,
                    "description": craft.description or "",
                    "score": score,
                    "image_url": craft.cover_image
                })

            for work in works:
                score = 10.0 if query_lower and query_lower in work.title.lower() else 5.0
                results.append({
                    "id": work.id,
                    "type": "work",
                    "title": work.title,
                    "description": work.description or "",
                    "score": score,
                    "image_url": work.image_url
                })

            results.sort(key=lambda x: x["score"], reverse=True)

            start = (page - 1) * page_size
            end = start + page_size
            paginated_results = results[start:end]

            return {
                "total": len(results),
                "results": paginated_results,
                "query": query,
                "page": page,
                "page_size": page_size,
                "total_pages": (len(results) + page_size - 1) // page_size,
                "fallback": True
            }
        finally:
            db.close()

    def get_suggestions(self, prefix: str) -> List[str]:
        if not self._connected and not self.connect():
            return []

        try:
            search_body = {
                "suggest": {
                    "title_suggest": {
                        "prefix": prefix,
                        "completion": {
                            "field": "title.suggest",
                            "size": 10,
                            "skip_duplicates": True
                        }
                    }
                }
            }
            response = self.client.search(index=self.index_name, body=search_body)
            suggestions = []
            for option in response["suggest"]["title_suggest"][0]["options"]:
                suggestions.append(option["text"])
            return suggestions
        except Exception as e:
            print(f"Suggestions error: {e}")
            return []

    def bulk_index(self, crafts: List[Craft] = None, works: List[Work] = None) -> int:
        count = 0
        if crafts:
            for craft in crafts:
                if self.index_craft(craft):
                    count += 1
        if works:
            for work in works:
                if self.index_work(work):
                    count += 1
        return count


search_service = SearchService()
