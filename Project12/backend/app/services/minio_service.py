from minio import Minio
from minio.error import S3Error
from app.config import settings
from typing import Optional, List
import io


class MinioService:
    def __init__(self):
        self.client = Minio(
            f"{settings.MINIO_ENDPOINT}:{settings.MINIO_PORT}",
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self.buckets = [
            settings.MINIO_BUCKET_3D,
            settings.MINIO_BUCKET_TEXTURE,
            settings.MINIO_BUCKET_POINTCLOUD
        ]
    
    def ensure_buckets(self):
        for bucket in self.buckets:
            try:
                if not self.client.bucket_exists(bucket):
                    self.client.make_bucket(bucket)
                    print(f"Bucket created: {bucket}")
            except S3Error as e:
                print(f"Bucket {bucket} check failed: {e}")
    
    def upload_file(self, bucket: str, file_name: str, file_data: bytes, content_type: str = "application/octet-stream"):
        try:
            self.client.put_object(
                bucket_name=bucket,
                object_name=file_name,
                data=io.BytesIO(file_data),
                length=len(file_data),
                content_type=content_type
            )
            return f"/{bucket}/{file_name}"
        except S3Error as e:
            raise Exception(f"Upload failed: {e}")
    
    def upload_file_stream(self, bucket: str, file_name: str, file_stream, file_size: int, content_type: str = "application/octet-stream"):
        try:
            self.client.put_object(
                bucket_name=bucket,
                object_name=file_name,
                data=file_stream,
                length=file_size,
                content_type=content_type
            )
            return f"/{bucket}/{file_name}"
        except S3Error as e:
            raise Exception(f"Upload failed: {e}")
    
    def get_file_url(self, bucket: str, file_name: str) -> Optional[str]:
        try:
            return self.client.presigned_get_object(bucket, file_name)
        except S3Error:
            return None
    
    def get_file(self, bucket: str, file_name: str):
        try:
            response = self.client.get_object(bucket, file_name)
            return response.read()
        except S3Error:
            return None
    
    def delete_file(self, bucket: str, file_name: str) -> bool:
        try:
            self.client.remove_object(bucket, file_name)
            return True
        except S3Error:
            return False
    
    def list_files(self, bucket: str, prefix: str = "") -> List[str]:
        try:
            objects = self.client.list_objects(bucket, prefix=prefix)
            return [obj.object_name for obj in objects]
        except S3Error:
            return []
    
    def get_file_info(self, bucket: str, file_name: str) -> Optional[dict]:
        try:
            stat = self.client.stat_object(bucket, file_name)
            return {
                "size": stat.size,
                "content_type": stat.content_type,
                "last_modified": stat.last_modified
            }
        except S3Error:
            return None


minio_service = MinioService()
