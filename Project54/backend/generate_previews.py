import os

previews_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "static", "previews")
os.makedirs(previews_dir, exist_ok=True)

preview_styles = [
    {"name": "simple_general", "primary": "#3B82F6", "secondary": "#EFF6FF", "title": "简洁通用简历模板"},
    {"name": "tech_engineer", "primary": "#10B981", "secondary": "#ECFDF5", "title": "技术岗简历模板"},
    {"name": "product_manager", "primary": "#8B5CF6", "secondary": "#F5F3FF", "title": "产品经理简历模板"},
    {"name": "finance_accountant", "primary": "#059669", "secondary": "#ECFDF5", "title": "财务会计简历模板"},
    {"name": "banking_cv", "primary": "#0891B2", "secondary": "#ECFEFF", "title": "银行求职简历模板"},
    {"name": "teacher_cv", "primary": "#DC2626", "secondary": "#FEF2F2", "title": "教师简历模板"},
    {"name": "trainer_cv", "primary": "#EA580C", "secondary": "#FFF7ED", "title": "培训师简历模板"},
    {"name": "ui_designer", "primary": "#EC4899", "secondary": "#FDF2F8", "title": "UI设计师简历模板"},
    {"name": "graphic_designer", "primary": "#D946EF", "secondary": "#FAF5FF", "title": "平面设计师简历模板"},
    {"name": "marketing_cv", "primary": "#F59E0B", "secondary": "#FFFBEB", "title": "市场营销简历模板"},
    {"name": "sales_manager", "primary": "#EF4444", "secondary": "#FEF2F2", "title": "销售经理简历模板"},
]

for style in preview_styles:
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
  <defs>
    <linearGradient id="grad_{style['name']}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{style['primary']};stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:{style['primary']};stop-opacity:0.05" />
    </linearGradient>
  </defs>
  <rect width="400" height="560" fill="white" stroke="#E5E7EB" stroke-width="2"/>
  <rect width="400" height="120" fill="{style['primary']}"/>
  <circle cx="60" cy="60" r="35" fill="white" opacity="0.9"/>
  <text x="110" y="55" font-family="Microsoft YaHei, sans-serif" font-size="20" fill="white" font-weight="bold">张三</text>
  <text x="110" y="80" font-family="Microsoft YaHei, sans-serif" font-size="14" fill="white" opacity="0.9">高级软件工程师</text>
  <text x="110" y="100" font-family="Microsoft YaHei, sans-serif" font-size="12" fill="white" opacity="0.8">138-0000-0000 | zhangsan@email.com</text>
  
  <rect x="20" y="140" width="360" height="30" fill="{style['secondary']}" rx="4"/>
  <text x="30" y="160" font-family="Microsoft YaHei, sans-serif" font-size="14" fill="{style['primary']}" font-weight="bold">个人简介</text>
  <rect x="30" y="180" width="340" height="6" fill="#E5E7EB" rx="2"/>
  <rect x="30" y="192" width="320" height="6" fill="#E5E7EB" rx="2"/>
  <rect x="30" y="204" width="300" height="6" fill="#E5E7EB" rx="2"/>
  
  <rect x="20" y="225" width="360" height="30" fill="{style['secondary']}" rx="4"/>
  <text x="30" y="245" font-family="Microsoft YaHei, sans-serif" font-size="14" fill="{style['primary']}" font-weight="bold">工作经历</text>
  <rect x="30" y="265" width="100" height="6" fill="#9CA3AF" rx="2"/>
  <rect x="30" y="277" width="340" height="6" fill="#E5E7EB" rx="2"/>
  <rect x="30" y="289" width="320" height="6" fill="#E5E7EB" rx="2"/>
  <rect x="30" y="301" width="300" height="6" fill="#E5E7EB" rx="2"/>
  
  <rect x="30" y="322" width="100" height="6" fill="#9CA3AF" rx="2"/>
  <rect x="30" y="334" width="340" height="6" fill="#E5E7EB" rx="2"/>
  <rect x="30" y="346" width="320" height="6" fill="#E5E7EB" rx="2"/>
  
  <rect x="20" y="367" width="360" height="30" fill="{style['secondary']}" rx="4"/>
  <text x="30" y="387" font-family="Microsoft YaHei, sans-serif" font-size="14" fill="{style['primary']}" font-weight="bold">项目经验</text>
  <rect x="30" y="407" width="120" height="6" fill="#9CA3AF" rx="2"/>
  <rect x="30" y="419" width="340" height="6" fill="#E5E7EB" rx="2"/>
  <rect x="30" y="431" width="320" height="6" fill="#E5E7EB" rx="2"/>
  
  <rect x="20" y="452" width="360" height="30" fill="{style['secondary']}" rx="4"/>
  <text x="30" y="472" font-family="Microsoft YaHei, sans-serif" font-size="14" fill="{style['primary']}" font-weight="bold">技能特长</text>
  <rect x="30" y="492" width="80" height="20" fill="{style['primary']}" opacity="0.2" rx="10"/>
  <text x="45" y="506" font-family="Microsoft YaHei, sans-serif" font-size="11" fill="{style['primary']}">Python</text>
  <rect x="120" y="492" width="80" height="20" fill="{style['primary']}" opacity="0.2" rx="10"/>
  <text x="135" y="506" font-family="Microsoft YaHei, sans-serif" font-size="11" fill="{style['primary']}">Java</text>
  <rect x="210" y="492" width="80" height="20" fill="{style['primary']}" opacity="0.2" rx="10"/>
  <text x="220" y="506" font-family="Microsoft YaHei, sans-serif" font-size="11" fill="{style['primary']}">MySQL</text>
  <rect x="300" y="492" width="80" height="20" fill="{style['primary']}" opacity="0.2" rx="10"/>
  <text x="310" y="506" font-family="Microsoft YaHei, sans-serif" font-size="11" fill="{style['primary']}">Git</text>
  
  <rect x="30" y="522" width="340" height="20" fill="url(#grad_{style['name']})" rx="4"/>
  <text x="200" y="536" font-family="Microsoft YaHei, sans-serif" font-size="10" fill="#6B7280" text-anchor="middle">{style['title']} - 预览</text>
</svg>'''
    
    file_path = os.path.join(previews_dir, f"{style['name']}.svg")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Created preview: {file_path}")

print("\nAll preview images generated successfully!")
