import uuid
from minio import Minio
from django.conf import settings


class MinioService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self.bucket = settings.MINIO_VIDEO_BUCKET
        self._ensure_bucket()

    def _ensure_bucket(self):
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
        except Exception:
            pass

    def upload_file(self, file, file_name=None):
        if file_name is None:
            file_name = file.name
        
        object_name = f"{uuid.uuid4()}_{file_name}"
        
        self.client.put_object(
            self.bucket,
            object_name,
            file,
            length=file.size,
            content_type=file.content_type
        )
        
        return object_name

    def get_file_url(self, object_name, expires=3600):
        return self.client.presigned_get_object(self.bucket, object_name, expires=expires)

    def delete_file(self, object_name):
        self.client.remove_object(self.bucket, object_name)

    def list_files(self):
        return self.client.list_objects(self.bucket)
