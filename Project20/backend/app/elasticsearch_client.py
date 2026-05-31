from elasticsearch import Elasticsearch
from typing import List, Dict, Any, Optional
import logging

from .config import settings

logger = logging.getLogger(__name__)


class ElasticsearchClient:
    def __init__(self):
        self.client = None
        self.index_name = "satellite_images"
        self._connect()

    def _connect(self):
        try:
            es_params = {
                "hosts": [settings.ELASTICSEARCH_HOST]
            }
            if settings.ELASTICSEARCH_USERNAME and settings.ELASTICSEARCH_PASSWORD:
                es_params["basic_auth"] = (
                    settings.ELASTICSEARCH_USERNAME,
                    settings.ELASTICSEARCH_PASSWORD
                )
            
            self.client = Elasticsearch(**es_params)
            if self.client.ping():
                logger.info("Connected to Elasticsearch successfully")
                self._create_index()
            else:
                logger.warning("Could not connect to Elasticsearch")
                self.client = None
        except Exception as e:
            logger.warning(f"Elasticsearch connection error: {e}")
            self.client = None

    def _create_index(self):
        if not self.client:
            return
        
        if not self.client.indices.exists(index=self.index_name):
            mappings = {
                "mappings": {
                    "properties": {
                        "id": {"type": "integer"},
                        "original_name": {"type": "text", "analyzer": "ik_max_word"},
                        "satellite_source": {"type": "keyword"},
                        "location": {"type": "text", "analyzer": "ik_max_word"},
                        "latitude": {"type": "float"},
                        "longitude": {"type": "float"},
                        "description": {"type": "text", "analyzer": "ik_max_word"},
                        "tags": {"type": "text", "analyzer": "ik_max_word"},
                        "capture_date": {"type": "date"},
                        "created_at": {"type": "date"},
                        "suggest": {
                            "type": "completion"
                        }
                    }
                }
            }
            self.client.indices.create(index=self.index_name, body=mappings)
            logger.info(f"Created index: {self.index_name}")

    def index_image(self, image_data: Dict[str, Any]) -> bool:
        if not self.client:
            return False
        
        try:
            doc = {
                "id": image_data.get("id"),
                "original_name": image_data.get("original_name", ""),
                "satellite_source": image_data.get("satellite_source", ""),
                "location": image_data.get("location", ""),
                "latitude": image_data.get("latitude"),
                "longitude": image_data.get("longitude"),
                "description": image_data.get("description", ""),
                "tags": image_data.get("tags", ""),
                "capture_date": image_data.get("capture_date"),
                "created_at": image_data.get("created_at"),
                "suggest": {
                    "input": [
                        image_data.get("original_name", ""),
                        image_data.get("location", ""),
                        image_data.get("tags", "")
                    ]
                }
            }
            
            self.client.index(
                index=self.index_name,
                id=image_data.get("id"),
                body=doc
            )
            return True
        except Exception as e:
            logger.error(f"Error indexing image: {e}")
            return False

    def search_images(self, query: str, filters: Optional[Dict] = None, size: int = 50) -> List[int]:
        if not self.client:
            return []
        
        try:
            search_body = {
                "query": {
                    "multi_match": {
                        "query": query,
                        "fields": ["original_name", "location", "description", "tags"]
                    }
                },
                "size": size
            }
            
            if filters:
                filter_clauses = []
                if "satellite_source" in filters:
                    filter_clauses.append({"term": {"satellite_source": filters["satellite_source"]}})
                if "location" in filters:
                    filter_clauses.append({"match": {"location": filters["location"]}})
                
                if filter_clauses:
                    search_body["query"] = {
                        "bool": {
                            "must": search_body["query"],
                            "filter": filter_clauses
                        }
                    }
            
            response = self.client.search(index=self.index_name, body=search_body)
            return [hit["_source"]["id"] for hit in response["hits"]["hits"]]
        except Exception as e:
            logger.error(f"Error searching images: {e}")
            return []

    def delete_image(self, image_id: int) -> bool:
        if not self.client:
            return False
        
        try:
            self.client.delete(index=self.index_name, id=image_id)
            return True
        except Exception as e:
            logger.error(f"Error deleting image from ES: {e}")
            return False


es_client = ElasticsearchClient()
