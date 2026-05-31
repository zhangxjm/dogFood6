import os
import sys
import uuid
import shutil
import numpy as np
from PIL import Image
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import SatelliteImage, Annotation, ModelInfo
from app.config import settings
from app.image_processor import image_processor
from app.elasticsearch_client import es_client


def generate_sample_image(width, height, color, pattern='solid'):
    img = np.zeros((height, width, 3), dtype=np.uint8)
    
    if pattern == 'solid':
        img[:] = color
    elif pattern == 'grid':
        for i in range(0, width, 50):
            img[:, i:i+2] = [50, 50, 50]
        for j in range(0, height, 50):
            img[j:j+2, :] = [50, 50, 50]
        for c in range(3):
            img[:, :, c] = np.where(img[:, :, 0] == 50, 50, color[c])
    elif pattern == 'gradient':
        for i in range(width):
            for j in range(height):
                img[j, i] = [
                    min(255, color[0] + int(i * 0.3)),
                    min(255, color[1] + int(j * 0.3)),
                    color[2]
                ]
    
    return img


def init_sample_data():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.THUMBNAIL_DIR, exist_ok=True)
    
    db = SessionLocal()
    
    try:
        if db.query(SatelliteImage).count() > 0:
            print("Sample data already exists, skipping initialization.")
            return
        
        sample_images = [
            {
                "name": "北京城市卫星图.png",
                "source": "高分七号",
                "location": "北京市朝阳区",
                "lat": 39.9042,
                "lon": 116.4074,
                "description": "北京市中心区域卫星遥感影像，包含大量建筑物",
                "tags": "城市,北京,建筑物,高分七号",
                "color": [180, 160, 140],
                "pattern": "grid"
            },
            {
                "name": "上海浦东开发区.png",
                "source": "高分六号",
                "location": "上海市浦东新区",
                "lat": 31.2304,
                "lon": 121.4737,
                "description": "上海浦东开发区卫星影像，展现城市发展",
                "tags": "城市,上海,开发区,高分六号",
                "color": [160, 170, 180],
                "pattern": "gradient"
            },
            {
                "name": "长江流域植被图.png",
                "source": "资源三号",
                "location": "长江流域",
                "lat": 30.5928,
                "lon": 114.3055,
                "description": "长江流域植被覆盖情况遥感监测",
                "tags": "植被,长江,生态,资源三号",
                "color": [34, 139, 34],
                "pattern": "gradient"
            },
            {
                "name": "黄土高原地貌图.png",
                "source": "高分五号",
                "location": "陕西省延安市",
                "lat": 36.5947,
                "lon": 109.4865,
                "description": "黄土高原典型地貌特征卫星影像",
                "tags": "地貌,黄土高原,地质,高分五号",
                "color": [210, 180, 140],
                "pattern": "solid"
            },
            {
                "name": "南海海域卫星图.png",
                "source": "海洋一号",
                "location": "南海海域",
                "lat": 15.8700,
                "lon": 112.5430,
                "description": "南海海域海洋环境监测卫星影像",
                "tags": "海洋,南海,水环境,海洋一号",
                "color": [65, 105, 225],
                "pattern": "gradient"
            }
        ]
        
        for idx, sample in enumerate(sample_images):
            file_extension = os.path.splitext(sample["name"])[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
            thumbnail_filename = f"thumb_{unique_filename}"
            thumbnail_path = os.path.join(settings.THUMBNAIL_DIR, thumbnail_filename)
            
            width, height = 800, 600
            img = generate_sample_image(width, height, sample["color"], sample["pattern"])
            
            if sample["pattern"] == "grid":
                for i in range(10, 20):
                    x, y = np.random.randint(100, width-100), np.random.randint(100, height-100)
                    w, h = np.random.randint(30, 80), np.random.randint(30, 80)
                    img[y:y+h, x:x+w] = [100 + np.random.randint(50), 100 + np.random.randint(50), 100 + np.random.randint(50)]
            
            pil_img = Image.fromarray(img)
            pil_img.save(file_path)
            
            image_processor.create_thumbnail(file_path, thumbnail_path)
            file_size = os.path.getsize(file_path)
            
            db_image = SatelliteImage(
                filename=unique_filename,
                original_name=sample["name"],
                file_path=file_path,
                thumbnail_path=thumbnail_path,
                file_size=file_size,
                width=width,
                height=height,
                satellite_source=sample["source"],
                location=sample["location"],
                latitude=sample["lat"],
                longitude=sample["lon"],
                description=sample["description"],
                tags=sample["tags"],
                es_indexed=False
            )
            
            db.add(db_image)
            db.commit()
            db.refresh(db_image)
            
            image_data = {
                "id": db_image.id,
                "original_name": db_image.original_name,
                "satellite_source": db_image.satellite_source,
                "location": db_image.location,
                "latitude": db_image.latitude,
                "longitude": db_image.longitude,
                "description": db_image.description,
                "tags": db_image.tags,
                "created_at": db_image.created_at.isoformat() if db_image.created_at else None
            }
            
            if es_client.index_image(image_data):
                db_image.es_indexed = True
                db.commit()
            
            num_annotations = np.random.randint(2, 5)
            for _ in range(num_annotations):
                annotation = Annotation(
                    image_id=db_image.id,
                    label=np.random.choice(["建筑物", "道路", "植被", "水域", "农田"]),
                    bbox_x=float(np.random.randint(50, 600)),
                    bbox_y=float(np.random.randint(50, 400)),
                    bbox_width=float(np.random.randint(30, 150)),
                    bbox_height=float(np.random.randint(30, 150)),
                    annotation_type="manual",
                    confidence=float(0.8 + np.random.random() * 0.2),
                    annotated_by="system"
                )
                db.add(annotation)
        
        sample_models = [
            {
                "name": "opencv_contour_detector",
                "type": "detection",
                "version": "1.0.0",
                "description": "基于OpenCV轮廓检测的地物识别模型",
                "accuracy": 0.75
            },
            {
                "name": "change_detector_v1",
                "type": "change_detection",
                "version": "1.0.0",
                "description": "基于像素差异的变化检测模型",
                "accuracy": 0.82
            }
        ]
        
        for model_info in sample_models:
            db_model = ModelInfo(
                model_name=model_info["name"],
                model_type=model_info["type"],
                version=model_info["version"],
                description=model_info["description"],
                accuracy=model_info["accuracy"],
                is_active=True
            )
            db.add(db_model)
        
        db.commit()
        print("Sample data initialized successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error initializing sample data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    init_sample_data()
