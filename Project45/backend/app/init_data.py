import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, CraftCategory, Craft, CraftStep, Work, TraceRecord
from app.services.auth import hash_password


def init_database():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count > 0:
            print("Database already initialized, skipping...")
            return

        print("Initializing database with sample data...")

        admin = User(
            username="admin",
            email="admin@heritage.com",
            hashed_password=hash_password("admin123"),
            full_name="系统管理员",
            role="admin",
            bio="非遗文化传承平台管理员"
        )

        instructor1 = User(
            username="master_zhang",
            email="zhang@heritage.com",
            hashed_password=hash_password("123456"),
            full_name="张大师",
            role="instructor",
            bio="国家级非遗传承人，从事陶瓷艺术40年"
        )

        instructor2 = User(
            username="master_li",
            email="li@heritage.com",
            hashed_password=hash_password("123456"),
            full_name="李老师",
            role="instructor",
            bio="苏绣传承人，作品多次获得国家级奖项"
        )

        user1 = User(
            username="learner_wang",
            email="wang@example.com",
            hashed_password=hash_password("123456"),
            full_name="王同学",
            role="user",
            bio="热爱非遗文化的学习者"
        )

        db.add_all([admin, instructor1, instructor2, user1])
        db.flush()

        cat1 = CraftCategory(name="陶瓷", description="中国传统陶瓷制作技艺，包含青花瓷、景德镇陶瓷等", icon="🏺")
        cat2 = CraftCategory(name="刺绣", description="中国传统刺绣技艺，包含苏绣、湘绣、粤绣、蜀绣", icon="🧵")
        cat3 = CraftCategory(name="木雕", description="中国传统木雕技艺，包含东阳木雕、黄杨木雕等", icon="🪵")
        cat4 = CraftCategory(name="剪纸", description="中国传统剪纸艺术，窗花、喜字等传统纹样", icon="✂️")
        cat5 = CraftCategory(name="皮影", description="中国传统皮影戏制作与表演技艺", icon="🎭")

        db.add_all([cat1, cat2, cat3, cat4, cat5])
        db.flush()

        craft1 = Craft(
            title="青花瓷制作基础",
            description="学习青花瓷的历史渊源、材料准备、拉坯成型、彩绘施釉等核心技艺。青花瓷是中国陶瓷艺术的瑰宝，始于唐代，盛于明清。",
            cover_image="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800",
            category_id=cat1.id,
            difficulty_level="beginner",
            estimated_time=180,
            materials="高岭土、瓷石、青花料、釉料",
            tools="陶轮、坯刀、画笔、釉刷、窑炉"
        )

        craft2 = Craft(
            title="苏绣基础针法",
            description="掌握苏绣的基本针法，包括齐针、套针、扎针等，学习传统花卉图案的刺绣技法。苏绣是中国四大名绣之首，以精细著称。",
            cover_image="https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=800",
            category_id=cat2.id,
            difficulty_level="beginner",
            estimated_time=120,
            materials="真丝面料、蚕丝线、花绷",
            tools="绣花针、剪刀、绣架"
        )

        craft3 = Craft(
            title="传统木雕技法",
            description="学习木雕的选材、设计、打坯、修光等工艺流程，掌握浮雕、圆雕等基本技法。",
            cover_image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
            category_id=cat3.id,
            difficulty_level="intermediate",
            estimated_time=240,
            materials="黄杨木、樟木、红木",
            tools="刻刀、木槌、砂纸、锉刀"
        )

        craft4 = Craft(
            title="中国传统剪纸",
            description="学习剪纸的基本纹样、折叠技法和刻制技巧，创作喜庆的窗花和装饰图案。",
            cover_image="https://images.unsplash.com/photo-1611162476849-25f21b955877?w=800",
            category_id=cat4.id,
            difficulty_level="beginner",
            estimated_time=60,
            materials="大红纸、宣纸",
            tools="剪刀、刻刀、蜡盘、镊子"
        )

        craft5 = Craft(
            title="景德镇陶瓷拉坯",
            description="深入学习陶瓷拉坯技艺，掌握 Centering（定心）、Opening（开孔）、Pulling（拉高）等核心技巧。",
            cover_image="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
            category_id=cat1.id,
            difficulty_level="intermediate",
            estimated_time=150,
            materials="陶泥、水",
            tools="陶轮、海绵、割线"
        )

        craft6 = Craft(
            title="皮影人物制作",
            description="学习传统皮影的雕刻、上色、装订工艺，制作精美的皮影人物形象。",
            cover_image="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
            category_id=cat5.id,
            difficulty_level="advanced",
            estimated_time=300,
            materials="驴皮、牛皮、透明漆",
            tools="刻刀、锥子、毛笔、颜料"
        )

        db.add_all([craft1, craft2, craft3, craft4, craft5, craft6])
        db.flush()

        steps_craft1 = [
            CraftStep(
                craft_id=craft1.id,
                step_number=1,
                title="材料准备与揉泥",
                description="准备优质高岭土和瓷石，按比例混合后反复揉压，排除泥料中的气泡，使泥料均匀致密。",
                tips="揉泥时要保持双手清洁，泥料软硬适中，太硬容易开裂，太软容易变形。",
                duration_seconds=900,
                image_url="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600"
            ),
            CraftStep(
                craft_id=craft1.id,
                step_number=2,
                title="拉坯成型",
                description="将泥团置于陶轮中心，双手配合控制陶轮转速，用拇指在泥团中心开孔，然后慢慢拉高形成器型。",
                tips="保持身体稳定，双手沾水保持润滑，呼吸均匀，力度要稳。",
                duration_seconds=1800,
                image_url="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600",
                video_url=""
            ),
            CraftStep(
                craft_id=craft1.id,
                step_number=3,
                title="修坯与晾干",
                description="待坯体半干后，进行修整，使器型规整，厚薄均匀。然后置于通风处自然阴干3-5天。",
                tips="阴干过程中要避免阳光直射和风吹，防止坯体开裂变形。",
                duration_seconds=7200,
                image_url=""
            ),
            CraftStep(
                craft_id=craft1.id,
                step_number=4,
                title="素烧",
                description="将晾干的坯体放入窑炉，以800°C进行素烧，使坯体坚固，便于后续彩绘。",
                tips="素烧升温要缓慢，避免坯体炸裂。",
                duration_seconds=3600,
                image_url=""
            ),
            CraftStep(
                craft_id=craft1.id,
                step_number=5,
                title="青花彩绘",
                description="用青花料在素烧后的坯体上绘制图案，注意料色的浓淡层次，运用勾勒、渲染等技法。",
                tips="彩绘时要一气呵成，避免反复涂改，否则会影响最终呈色。",
                duration_seconds=2400,
                image_url="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600"
            ),
            CraftStep(
                craft_id=craft1.id,
                step_number=6,
                title="施釉",
                description="在彩绘完成的坯体上均匀施一层透明釉，可以采用浸釉、喷釉或刷釉的方法。",
                tips="釉层厚薄要均匀，过厚容易流釉，过薄则光泽度不够。",
                duration_seconds=600,
                image_url=""
            ),
            CraftStep(
                craft_id=craft1.id,
                step_number=7,
                title="高温烧成",
                description="将施釉后的坯体放入窑炉，以1300°C左右的高温还原焰烧成。这是形成青花瓷独特色泽的关键步骤。",
                tips="控制好窑温和气氛，还原焰阶段要严密监控，这决定了青花的发色效果。",
                duration_seconds=5400,
                image_url=""
            ),
            CraftStep(
                craft_id=craft1.id,
                step_number=8,
                title="出窑检验",
                description="待窑温自然冷却后，取出成品，检查釉色、器型、彩绘效果，进行品质评定。",
                tips="出窑时要小心轻放，刚出窑的瓷器温度仍高，注意防烫。",
                duration_seconds=300,
                image_url=""
            )
        ]

        steps_craft2 = [
            CraftStep(
                craft_id=craft2.id,
                step_number=1,
                title="材料准备",
                description="选择优质真丝面料作为底布，根据图案配色挑选蚕丝线，将面料固定在花绷上绷紧。",
                tips="面料要绷紧平整，否则刺绣时容易起皱变形。",
                duration_seconds=600,
                image_url="https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=600"
            ),
            CraftStep(
                craft_id=craft2.id,
                step_number=2,
                title="图案设计与拓印",
                description="设计传统花卉图案，用宣纸将图案描绘下来，然后用浆糊将图案拓印到面料上。",
                tips="拓印时要轻，不要让浆糊浸透面料，影响刺绣效果。",
                duration_seconds=900,
                image_url=""
            ),
            CraftStep(
                craft_id=craft2.id,
                step_number=3,
                title="齐针练习",
                description="学习最基础的齐针针法，线条排列整齐，不露底、不重叠，针脚均匀。",
                tips="针脚长度一般在0.5-1厘米之间，根据图案大小灵活调整。",
                duration_seconds=1800,
                image_url=""
            ),
            CraftStep(
                craft_id=craft2.id,
                step_number=4,
                title="套针运用",
                description="学习套针针法，用于表现色彩过渡和明暗层次，这是苏绣最具特色的针法之一。",
                tips="套针要注意前后针脚的衔接，色彩过渡要自然柔和。",
                duration_seconds=1800,
                image_url=""
            ),
            CraftStep(
                craft_id=craft2.id,
                step_number=5,
                title="花瓣刺绣",
                description="综合运用齐针和套针，刺绣花瓣部分，注意表现花瓣的自然卷曲和色彩层次。",
                tips="从花瓣边缘向中心刺绣，颜色由浅入深，表现立体感。",
                duration_seconds=1200,
                image_url=""
            ),
            CraftStep(
                craft_id=craft2.id,
                step_number=6,
                title="整理与装裱",
                description="刺绣完成后，从花绷上取下，用熨斗轻轻熨平，然后进行装裱。",
                tips="熨烫时要在绣品上垫一层湿布，防止丝线被烫坏。",
                duration_seconds=300,
                image_url=""
            )
        ]

        db.add_all(steps_craft1 + steps_craft2)
        db.flush()

        work1 = Work(
            title="青花瓷瓶「花开富贵」",
            description="采用传统青花瓷工艺，手工拉坯成型，瓶身绘有牡丹图案，寓意花开富贵。",
            image_url="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600",
            creator_id=instructor1.id,
            craft_id=craft1.id,
            traceability_code="HC20240101120000A1B2C3D4E5F678",
            material_sources="高岭土产自景德镇高岭村，青花料为天然钴料",
            creation_process="历时30天，经过72道工序纯手工制作",
            quality_verified=True
        )

        work2 = Work(
            title="苏绣摆件「荷塘月色」",
            description="以苏州园林荷塘为题材，运用苏绣多种针法，表现月光下的荷塘美景。",
            image_url="https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=600",
            creator_id=instructor2.id,
            craft_id=craft2.id,
            traceability_code="HC20240105153000F8E7D6C5B4A392",
            material_sources="真丝面料产自苏州，蚕丝线为手工纺制",
            creation_process="耗时3个月，运用12种传统针法",
            quality_verified=True
        )

        work3 = Work(
            title="木雕挂件「松鹤延年」",
            description="选用百年黄杨木，雕刻松鹤图案，寓意长寿吉祥。",
            image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
            creator_id=instructor1.id,
            craft_id=craft3.id,
            traceability_code="HC20240110101500C7B6A594837261",
            material_sources="黄杨木产自浙江乐清，树龄80年",
            creation_process="历时2个月，经过打坯、修光、打磨等多道工序",
            quality_verified=False
        )

        db.add_all([work1, work2, work3])
        db.flush()

        trace_work1 = [
            TraceRecord(
                work_id=work1.id,
                step_number=1,
                action="材料精选",
                description="选用景德镇特级高岭土，经过3次淘洗沉淀",
                operator="张大师",
                location="景德镇制瓷工坊",
                temperature=25.0,
                humidity=60.0
            ),
            TraceRecord(
                work_id=work1.id,
                step_number=2,
                action="手工揉泥",
                description="反复揉压泥料2小时，排除气泡，使泥料均匀",
                operator="张大师",
                location="景德镇制瓷工坊",
                temperature=24.5,
                humidity=62.0
            ),
            TraceRecord(
                work_id=work1.id,
                step_number=3,
                action="拉坯成型",
                description="手工拉坯，器型端正，壁厚均匀",
                operator="张大师",
                location="景德镇制瓷工坊",
                temperature=26.0,
                humidity=58.0
            ),
            TraceRecord(
                work_id=work1.id,
                step_number=4,
                action="自然阴干",
                description="置于恒温恒湿房间阴干5天",
                operator="系统",
                location="阴干室",
                temperature=22.0,
                humidity=55.0
            ),
            TraceRecord(
                work_id=work1.id,
                step_number=5,
                action="素烧",
                description="800°C素烧12小时",
                operator="窑工老李",
                location="柴窑",
                temperature=800.0,
                humidity=10.0
            ),
            TraceRecord(
                work_id=work1.id,
                step_number=6,
                action="手绘青花",
                description="绘制牡丹图案，运用勾勒、渲染技法",
                operator="张大师",
                location="彩绘工作室",
                temperature=23.0,
                humidity=50.0
            ),
            TraceRecord(
                work_id=work1.id,
                step_number=7,
                action="施釉",
                description="采用浸釉法，釉层均匀",
                operator="张大师",
                location="施釉车间",
                temperature=24.0,
                humidity=52.0
            ),
            TraceRecord(
                work_id=work1.id,
                step_number=8,
                action="高温烧成",
                description="1320°C还原焰烧成36小时",
                operator="窑工老李",
                location="柴窑",
                temperature=1320.0,
                humidity=5.0
            ),
            TraceRecord(
                work_id=work1.id,
                step_number=9,
                action="品质检验",
                description="经国家级非遗传承人鉴定，达到一级品标准",
                operator="鉴定委员会",
                location="质检中心",
                temperature=22.0,
                humidity=45.0
            )
        ]

        db.add_all(trace_work1)
        db.commit()

        print("Database initialization completed successfully!")
        print("Created users: admin/admin123, master_zhang/123456, master_li/123456, learner_wang/123456")
        print("Created 5 craft categories")
        print("Created 6 crafts with detailed steps")
        print("Created 3 sample works with traceability records")

    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    init_database()
