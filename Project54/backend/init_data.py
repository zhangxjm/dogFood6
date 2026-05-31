import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app import models, crud, schemas

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    categories_data = [
        {"name": "互联网/IT", "description": "适合计算机、软件工程、互联网相关岗位", "icon": "💻", "sort_order": 1},
        {"name": "金融/财会", "description": "适合银行、证券、会计、财务相关岗位", "icon": "💰", "sort_order": 2},
        {"name": "教育/培训", "description": "适合教师、培训、教育相关岗位", "icon": "📚", "sort_order": 3},
        {"name": "设计/创意", "description": "适合UI设计、平面设计、创意相关岗位", "icon": "🎨", "sort_order": 4},
        {"name": "市场/销售", "description": "适合市场营销、销售、商务相关岗位", "icon": "📈", "sort_order": 5},
    ]

    category_ids = {}
    for cat_data in categories_data:
        existing = crud.get_category_by_name(db, cat_data["name"])
        if not existing:
            category = schemas.CategoryCreate(**cat_data)
            created = crud.create_category(db, category)
            category_ids[cat_data["name"]] = created.id
            print(f"Created category: {cat_data['name']}")
        else:
            category_ids[cat_data["name"]] = existing.id
            print(f"Category already exists: {cat_data['name']}")

    templates_data = [
        {
            "name": "简洁通用简历模板",
            "description": "经典简洁风格，适合各类岗位投递，排版清晰专业",
            "category_name": "互联网/IT",
            "file_path": "static/templates/simple_general.docx",
            "preview_image": "static/previews/simple_general.svg",
        },
        {
            "name": "技术岗简历模板",
            "description": "突出技术栈和项目经验，适合研发工程师岗位",
            "category_name": "互联网/IT",
            "file_path": "static/templates/tech_engineer.docx",
            "preview_image": "static/previews/tech_engineer.svg",
        },
        {
            "name": "产品经理简历模板",
            "description": "突出产品思维和项目成果，适合产品岗",
            "category_name": "互联网/IT",
            "file_path": "static/templates/product_manager.docx",
            "preview_image": "static/previews/product_manager.svg",
        },
        {
            "name": "财务会计简历模板",
            "description": "专业稳重风格，突出财务经验和资质证书",
            "category_name": "金融/财会",
            "file_path": "static/templates/finance_accountant.docx",
            "preview_image": "static/previews/finance_accountant.svg",
        },
        {
            "name": "银行求职简历模板",
            "description": "适合银行校招和社招，突出实习经历",
            "category_name": "金融/财会",
            "file_path": "static/templates/banking_cv.docx",
            "preview_image": "static/previews/banking_cv.svg",
        },
        {
            "name": "教师简历模板",
            "description": "突出教学经验和教育背景，适合教师岗位",
            "category_name": "教育/培训",
            "file_path": "static/templates/teacher_cv.docx",
            "preview_image": "static/previews/teacher_cv.svg",
        },
        {
            "name": "培训师简历模板",
            "description": "突出课程开发和培训经验，适合企业培训岗",
            "category_name": "教育/培训",
            "file_path": "static/templates/trainer_cv.docx",
            "preview_image": "static/previews/trainer_cv.svg",
        },
        {
            "name": "UI设计师简历模板",
            "description": "创意风格，附作品集展示区，适合设计岗",
            "category_name": "设计/创意",
            "file_path": "static/templates/ui_designer.docx",
            "preview_image": "static/previews/ui_designer.svg",
        },
        {
            "name": "平面设计师简历模板",
            "description": "艺术感强，突出设计作品和软件技能",
            "category_name": "设计/创意",
            "file_path": "static/templates/graphic_designer.docx",
            "preview_image": "static/previews/graphic_designer.svg",
        },
        {
            "name": "市场营销简历模板",
            "description": "突出营销案例和数据成果，适合市场岗",
            "category_name": "市场/销售",
            "file_path": "static/templates/marketing_cv.docx",
            "preview_image": "static/previews/marketing_cv.svg",
        },
        {
            "name": "销售经理简历模板",
            "description": "突出销售业绩和客户资源，适合销售管理岗",
            "category_name": "市场/销售",
            "file_path": "static/templates/sales_manager.docx",
            "preview_image": "static/previews/sales_manager.svg",
        },
    ]

    template_ids = []
    existing_templates = crud.get_templates(db, limit=100)
    existing_names = {t.get('name') for t in existing_templates} if existing_templates else set()

    for tpl_data in templates_data:
        if tpl_data["name"] not in existing_names:
            category_id = category_ids.get(tpl_data["category_name"])
            if category_id:
                tpl_data_copy = {k: v for k, v in tpl_data.items() if k != "category_name"}
                tpl_data_copy["category_id"] = category_id
                template = schemas.TemplateCreate(**tpl_data_copy)
                created = crud.create_template(db, template)
                template_ids.append(created.id)
                print(f"Created template: {tpl_data['name']}")
        else:
            print(f"Template already exists: {tpl_data['name']}")

    notes_data = [
        {"template_index": 0, "title": "简历制作要点", "content": "1. 个人信息简洁明了\n2. 求职意向明确\n3. 工作经验按时间倒序排列\n4. 突出关键词，匹配岗位要求"},
        {"template_index": 0, "title": "注意事项", "content": "使用PDF格式投递，避免Word格式排版错乱。文件名建议：姓名-应聘岗位-简历.docx"},
        {"template_index": 1, "title": "技术栈写法", "content": "技术栈分类列出：\n- 编程语言：Python, Java, Go\n- 框架：Spring Boot, Django, Vue\n- 数据库：MySQL, Redis, MongoDB\n- 工具：Git, Docker, Jenkins"},
        {"template_index": 1, "title": "项目经验STAR法则", "content": "Situation：项目背景\nTask：你的任务\nAction：具体行动\nResult：量化成果（提升XX%，减少XX时间）"},
        {"template_index": 3, "title": "财务简历亮点", "content": "1. 突出持有证书：CPA, ACCA, 初级/中级会计师\n2. 列出熟悉的财务软件：用友, 金蝶, SAP\n3. 量化工作成果：优化报表流程提升效率30%"},
        {"template_index": 5, "title": "教师简历技巧", "content": "1. 突出教学成果：班级成绩排名提升\n2. 列出教研成果：发表论文、参与课题\n3. 展示教学技能：教师资格证、普通话证书"},
        {"template_index": 7, "title": "设计师简历必备", "content": "1. 务必附上作品集链接\n2. 列出熟练软件：Figma, Sketch, Adobe系列\n3. 简要描述设计思路和方法论"},
        {"template_index": 9, "title": "市场简历加分项", "content": "1. 量化营销成果：曝光量、转化率、ROI\n2. 列举成功案例，说明你的角色和贡献\n3. 展示数据分析能力和工具使用"},
    ]

    all_templates = crud.get_templates(db, limit=100)
    for note_data in notes_data:
        tpl_idx = note_data["template_index"]
        if tpl_idx < len(all_templates):
            template_id = all_templates[tpl_idx]["id"]
            note = schemas.NoteCreate(
                template_id=template_id,
                title=note_data["title"],
                content=note_data["content"]
            )
            crud.create_note(db, note)
            print(f"Created note for template {template_id}: {note_data['title']}")

    print("\nData initialization completed successfully!")

except Exception as e:
    print(f"Error during initialization: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
