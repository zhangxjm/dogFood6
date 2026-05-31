from app.database import Base, engine
from app.models.models import HeritageModel, PointCloudTask, TextureRestoration, CopyrightRecord
from sqlalchemy.orm import Session
from datetime import datetime
import json


def init_db():
    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    heritage_count = db.query(HeritageModel).count()
    if heritage_count > 0:
        print("Data already exists, skip seeding")
        return
    
    heritage_items = [
        {
            "name": "三星堆青铜面具",
            "description": "商代晚期青铜器，1986年出土于四川广汉三星堆遗址二号祭祀坑，是三星堆文化的代表性器物之一。",
            "category": "青铜器",
            "dynasty": "商代晚期",
            "location": "四川广汉三星堆",
            "model_format": "GLB",
            "model_size": 45.2,
            "vertex_count": 156800,
            "face_count": 312400,
            "texture_resolution": "4096x4096",
            "is_restored": True,
            "restoration_status": "completed",
            "copyright_registered": True
        },
        {
            "name": "兵马俑一号坑战车",
            "description": "秦始皇陵兵马俑一号坑中的战车俑群，展现了秦代军队的编制和装备情况。",
            "category": "陶俑",
            "dynasty": "秦代",
            "location": "陕西西安秦始皇陵",
            "model_format": "GLB",
            "model_size": 128.5,
            "vertex_count": 456200,
            "face_count": 892100,
            "texture_resolution": "8192x8192",
            "is_restored": False,
            "restoration_status": "pending",
            "copyright_registered": True
        },
        {
            "name": "马王堆汉墓漆器",
            "description": "长沙马王堆汉墓出土的精美漆器，代表了汉代漆器工艺的最高水平。",
            "category": "漆器",
            "dynasty": "西汉",
            "location": "湖南长沙马王堆",
            "model_format": "OBJ",
            "model_size": 32.8,
            "vertex_count": 98400,
            "face_count": 196200,
            "texture_resolution": "4096x4096",
            "is_restored": True,
            "restoration_status": "completed",
            "copyright_registered": False
        },
        {
            "name": "敦煌莫高窟壁画",
            "description": "敦煌莫高窟第257窟九色鹿本生故事壁画，是北魏时期的代表性作品。",
            "category": "壁画",
            "dynasty": "北魏",
            "location": "甘肃敦煌莫高窟",
            "model_format": "GLB",
            "model_size": 56.3,
            "vertex_count": 186500,
            "face_count": 372800,
            "texture_resolution": "8192x8192",
            "is_restored": True,
            "restoration_status": "completed",
            "copyright_registered": True
        },
        {
            "name": "曾侯乙编钟",
            "description": "战国早期曾国国君乙的墓葬中出土的一套大型礼乐重器，是迄今发现的最完整的一套编钟。",
            "category": "青铜器",
            "dynasty": "战国早期",
            "location": "湖北随州擂鼓墩",
            "model_format": "FBX",
            "model_size": 89.6,
            "vertex_count": 289300,
            "face_count": 578600,
            "texture_resolution": "4096x4096",
            "is_restored": False,
            "restoration_status": "in_progress",
            "copyright_registered": True
        },
        {
            "name": "青花瓷龙纹大盘",
            "description": "明代永乐年间官窑出品的青花瓷大盘，盘心绘有五爪龙纹，是明代青花瓷的精品。",
            "category": "瓷器",
            "dynasty": "明代永乐",
            "location": "景德镇官窑遗址",
            "model_format": "GLB",
            "model_size": 28.4,
            "vertex_count": 78200,
            "face_count": 156400,
            "texture_resolution": "4096x4096",
            "is_restored": True,
            "restoration_status": "completed",
            "copyright_registered": False
        }
    ]
    
    created_heritage = []
    for item in heritage_items:
        heritage = HeritageModel(**item)
        db.add(heritage)
        created_heritage.append(heritage)
    
    db.flush()
    
    pointcloud_tasks = [
        {
            "heritage_id": created_heritage[0].id,
            "task_name": "三星堆青铜面具点云处理",
            "status": "completed",
            "progress": 100.0,
            "point_count": 2456000,
            "algorithm": "泊松表面重建",
            "parameters": json.dumps({"octree_depth": 10, "samples_per_node": 1.0}),
            "started_at": datetime(2024, 1, 15, 10, 30, 0),
            "completed_at": datetime(2024, 1, 15, 14, 45, 0)
        },
        {
            "heritage_id": created_heritage[4].id,
            "task_name": "曾侯乙编钟点云去噪",
            "status": "in_progress",
            "progress": 65.0,
            "point_count": 5680000,
            "algorithm": "统计滤波+半径滤波",
            "parameters": json.dumps({"mean_k": 20, "std_ratio": 2.0}),
            "started_at": datetime(2024, 3, 20, 9, 0, 0),
            "completed_at": None
        },
        {
            "heritage_id": created_heritage[1].id,
            "task_name": "兵马俑战车点云配准",
            "status": "pending",
            "progress": 0.0,
            "point_count": 12500000,
            "algorithm": "ICP精配准",
            "parameters": json.dumps({"max_correspondence": 0.05, "transformation_epsilon": 1e-8}),
            "started_at": None,
            "completed_at": None
        }
    ]
    
    for task in pointcloud_tasks:
        db.add(PointCloudTask(**task))
    
    texture_restorations = [
        {
            "heritage_id": created_heritage[0].id,
            "restoration_type": "AI纹理修复",
            "parameters": json.dumps({"model": "LaMa", "mask_threshold": 0.3}),
            "status": "completed",
            "confidence": 0.95,
            "completed_at": datetime(2024, 1, 20, 16, 0, 0)
        },
        {
            "heritage_id": created_heritage[3].id,
            "restoration_type": "壁画裂纹修复",
            "parameters": json.dumps({"method": "inpainting", "radius": 5}),
            "status": "completed",
            "confidence": 0.88,
            "completed_at": datetime(2024, 2, 10, 11, 30, 0)
        },
        {
            "heritage_id": created_heritage[4].id,
            "restoration_type": "锈蚀纹理还原",
            "parameters": json.dumps({"method": "neural_rendering", "iterations": 5000}),
            "status": "in_progress",
            "confidence": None,
            "completed_at": None
        }
    ]
    
    for restoration in texture_restorations:
        db.add(TextureRestoration(**restoration))
    
    copyright_records = [
        {
            "heritage_id": created_heritage[0].id,
            "work_name": "三星堆青铜面具三维数字模型",
            "author": "三星堆博物馆",
            "creation_date": "2024-01-20",
            "register_hash": "0x7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
            "transaction_id": "0xabc123def456...",
            "block_number": "18567234",
            "certificate_url": "/certificates/sanxingdui_mask.pdf",
            "work_metadata": json.dumps({"model_version": "1.0", "creation_method": "photogrammetry"})
        },
        {
            "heritage_id": created_heritage[1].id,
            "work_name": "秦始皇陵兵马俑战车三维数字化",
            "author": "秦始皇兵马俑博物馆",
            "creation_date": "2024-02-15",
            "register_hash": "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
            "transaction_id": "0xdef456abc789...",
            "block_number": "18678345",
            "certificate_url": "/certificates/terracotta_chariot.pdf",
            "work_metadata": json.dumps({"model_version": "2.1", "creation_method": "laser_scanning"})
        },
        {
            "heritage_id": created_heritage[3].id,
            "work_name": "敦煌莫高窟第257窟壁画三维重建",
            "author": "敦煌研究院",
            "creation_date": "2024-02-28",
            "register_hash": "0x9f8e7d6c5b4a39281706f5e4d3c2b1a09887766554433221100ffeeddccbbaa99",
            "transaction_id": "0xghi789jkl012...",
            "block_number": "18712456",
            "certificate_url": "/certificates/dunhuang_mural.pdf",
            "work_metadata": json.dumps({"model_version": "1.2", "creation_method": "photogrammetry + texture_mapping"})
        },
        {
            "heritage_id": created_heritage[4].id,
            "work_name": "曾侯乙编钟高精度三维模型",
            "author": "湖北省博物馆",
            "creation_date": "2024-03-10",
            "register_hash": "0x11223344556677889900aabbccddeeff0011223344556677889900aabbccddeeff",
            "transaction_id": "0xjkl345mno678...",
            "block_number": "18756789",
            "certificate_url": "/certificates/bianzhong.pdf",
            "work_metadata": json.dumps({"model_version": "3.0", "creation_method": "structured_light_scanning"})
        }
    ]
    
    for record in copyright_records:
        db.add(CopyrightRecord(**record))
    
    db.commit()
    print("Sample data seeded successfully!")
