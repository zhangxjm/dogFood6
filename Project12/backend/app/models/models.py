from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base


class HeritageModel(Base):
    __tablename__ = "heritage_models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, comment="文物名称")
    description = Column(Text, comment="文物描述")
    category = Column(String(100), comment="文物类别")
    dynasty = Column(String(100), comment="所属朝代")
    location = Column(String(200), comment="出土地点")
    model_url = Column(String(500), comment="3D模型存储路径")
    texture_url = Column(String(500), comment="纹理贴图存储路径")
    pointcloud_url = Column(String(500), comment="点云数据存储路径")
    model_format = Column(String(20), comment="模型格式(OBJ/GLB/FBX)")
    model_size = Column(Float, comment="模型文件大小(MB)")
    vertex_count = Column(Integer, comment="顶点数量")
    face_count = Column(Integer, comment="面片数量")
    texture_resolution = Column(String(20), comment="纹理分辨率")
    is_restored = Column(Boolean, default=False, comment="是否已修复")
    restoration_status = Column(String(50), default="pending", comment="修复状态")
    copyright_registered = Column(Boolean, default=False, comment="是否已版权存证")
    copyright_hash = Column(String(200), comment="版权存证哈希")
    copyright_register_time = Column(DateTime, comment="版权存证时间")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PointCloudTask(Base):
    __tablename__ = "pointcloud_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    heritage_id = Column(Integer, nullable=False, comment="关联文物ID")
    task_name = Column(String(200), comment="任务名称")
    input_file = Column(String(500), comment="输入点云文件路径")
    output_file = Column(String(500), comment="输出模型文件路径")
    status = Column(String(50), default="pending", comment="任务状态")
    progress = Column(Float, default=0.0, comment="处理进度")
    point_count = Column(Integer, comment="点云点数")
    algorithm = Column(String(100), comment="处理算法")
    parameters = Column(Text, comment="处理参数JSON")
    error_message = Column(Text, comment="错误信息")
    started_at = Column(DateTime, comment="开始时间")
    completed_at = Column(DateTime, comment="完成时间")
    created_at = Column(DateTime, server_default=func.now())


class TextureRestoration(Base):
    __tablename__ = "texture_restorations"
    
    id = Column(Integer, primary_key=True, index=True)
    heritage_id = Column(Integer, nullable=False, comment="关联文物ID")
    original_texture = Column(String(500), comment="原始纹理路径")
    restored_texture = Column(String(500), comment="修复后纹理路径")
    restoration_type = Column(String(100), comment="修复类型")
    parameters = Column(Text, comment="修复参数JSON")
    status = Column(String(50), default="pending", comment="修复状态")
    confidence = Column(Float, comment="修复置信度")
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, comment="完成时间")


class CopyrightRecord(Base):
    __tablename__ = "copyright_records"
    
    id = Column(Integer, primary_key=True, index=True)
    heritage_id = Column(Integer, nullable=False, comment="关联文物ID")
    work_name = Column(String(200), comment="作品名称")
    author = Column(String(100), comment="作者/权利人")
    creation_date = Column(String(50), comment="创作日期")
    register_hash = Column(String(200), comment="区块链存证哈希")
    transaction_id = Column(String(200), comment="交易ID")
    block_number = Column(String(100), comment="区块号")
    timestamp = Column(DateTime, server_default=func.now())
    certificate_url = Column(String(500), comment="存证证书路径")
    status = Column(String(50), default="registered", comment="存证状态")
    work_metadata = Column(Text, comment="元数据JSON")
