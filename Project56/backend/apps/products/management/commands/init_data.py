from datetime import timedelta
from decimal import Decimal
from urllib.parse import quote
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from apps.products.models import Category, Product
from apps.members.models import MemberProfile, MemberTask, UserBehavior
from apps.campaigns.models import Coupon, Campaign, GroupBuy
from apps.customize.models import CustomizeTemplate
from apps.recommendations.models import UserPreference


def build_image_url(prompt):
    base_url = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'
    return f'{base_url}?prompt={quote(prompt)}&image_size=square'


class Command(BaseCommand):
    help = '初始化非遗文创电商私域运营系统示例数据'

    def handle(self, *args, **options):
        self.stdout.write('开始初始化数据...')
        self._create_superuser()
        self._create_categories()
        self._create_products()
        self._create_customize_templates()
        self._create_coupons()
        self._create_member_tasks()
        self._create_campaigns()
        self._create_group_buys()
        self._create_demo_users()
        self._create_sample_behaviors()
        self.stdout.write(self.style.SUCCESS('数据初始化完成！'))

    def _create_superuser(self):
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={'is_superuser': True, 'is_staff': True}
        )
        if created:
            user.set_password('admin123')
            user.save()
            self.stdout.write('创建超级管理员: admin/admin123')
        else:
            self.stdout.write('超级管理员已存在，跳过')

    def _create_categories(self):
        categories = [
            ('刺绣', ''),
            ('陶瓷', ''),
            ('剪纸', ''),
            ('漆器', ''),
            ('织锦', ''),
            ('木雕', ''),
        ]
        for name, icon in categories:
            Category.objects.get_or_create(name=name, defaults={'icon': icon})
        self.stdout.write(f'创建{len(categories)}个分类')

    def _create_products(self):
        products_data = {
            '刺绣': [
                ('苏绣团扇', '精选上等丝绸，以苏绣技法手工绣制花鸟图案，轻摇间尽显东方韵味', 268, True, '苏绣起源于苏州，是中国四大名绣之一，有两千多年历史。', 'Suzhou embroidery silk fan with bird and flower pattern, traditional Chinese handicraft'),
                ('蜀绣手帕', '采用传统蜀绣工艺，在纯棉手帕上绣制熊猫竹子图案', 168, False, '蜀绣又称川绣，以软缎和彩丝为主要原料，针法多达百余种。', 'Shu embroidery cotton handkerchief with panda and bamboo design, Sichuan traditional craft'),
                ('湘绣屏风', '大型湘绣双面绣屏风，以狮虎为题材，气势磅礴', 1288, False, '湘绣以湖南长沙为中心，擅长绣制狮虎等动物形象。', 'Xiang embroidery double-sided screen with lion and tiger motif, Hunan traditional art'),
                ('粤绣披肩', '岭南风格粤绣披肩，金银线绣制，华贵典雅', 588, True, '粤绣以广州为中心，使用金银线绣制，色彩浓艳。', 'Yue embroidery shawl with gold and silver thread, Guangdong traditional luxury craft'),
            ],
            '陶瓷': [
                ('景德镇青花瓷杯', '景德镇传统青花瓷茶杯，手绘山水图案，瓷质细腻温润', 128, True, '景德镇陶瓷始于汉世，青花瓷更是中华瓷文化的代表。', 'Jingdezhen blue and white porcelain teacup with hand-painted landscape, Chinese ceramic art'),
                ('汝窑天青釉茶壶', '仿宋代汝窑工艺，天青釉色温润如玉，开片自然美观', 688, False, '汝窑为宋代五大名窑之首，天青釉色雨过天晴。', 'Ru ware sky blue glaze teapot, Song Dynasty style ceramic, crackle glaze'),
                ('龙泉青瓷花瓶', '浙江龙泉传统青瓷工艺，梅子青釉色，造型端庄大方', 368, False, '龙泉青瓷始于三国两晋，以釉色青翠著称。', 'Longquan celadon porcelain vase, plum green glaze, Zhejiang traditional ceramic'),
                ('建盏茶碗', '传统建阳建盏工艺，兔毫釉面，适合品茶赏玩', 258, True, '建盏是宋代皇室御用茶器，独特铁系结晶釉。', 'Jian ware tea bowl with hare\'s fur glaze, Song Dynasty royal tea ware'),
                ('紫砂壶', '宜兴紫砂壶，全手工制作，泥质细腻，透气性好', 888, True, '宜兴紫砂壶制作技艺始于明朝，以独特双气孔结构闻名。', 'Yixing purple clay teapot, handcrafted, traditional Chinese tea ceremony'),
            ],
            '剪纸': [
                ('剪纸灯笼', '传统剪纸艺术与灯笼结合，透光后呈现精美图案', 68, False, '中国剪纸有两千多年历史，2009年入选人类非遗。', 'Chinese paper-cut lantern, traditional folk art, intricate red patterns'),
                ('窗花礼盒', '精选十二生肖剪纸窗花，喜庆红纸，年节必备', 98, True, '窗花是剪纸最常见的应用形式，增添节日喜庆氛围。', 'Chinese zodiac paper-cut window decorations gift box, festive red paper art'),
                ('剪纸卷轴', '名家剪纸作品装裱卷轴，适合家居装饰收藏', 358, False, '将传统剪纸以卷轴形式呈现，提升观赏和收藏价值。', 'Chinese paper-cut artwork mounted on scroll, home decoration, collectible art'),
            ],
            '漆器': [
                ('雕漆首饰盒', '北京雕漆工艺首饰盒，层层髹漆精雕而成', 488, True, '雕漆需经百余道工序，数月乃至数年方能完成一件。', 'Beijing carved lacquer jewelry box, layered lacquer, intricate carving'),
                ('脱胎漆器花瓶', '福州脱胎漆器，轻巧如羽，漆面光润，彩绘精美', 568, False, '福州脱胎漆器与景德镇瓷器并称中国传统工艺三宝。', 'Fuzhou bodiless lacquerware vase, lightweight, polished lacquer, painted decoration'),
                ('漆器茶盘', '扬州漆器茶盘，螺钿镶嵌工艺，雅致大方', 388, True, '扬州漆器以螺钿镶嵌著称，美轮美奂。', 'Yangzhou lacquer tea tray with mother-of-pearl inlay, elegant Chinese craft'),
            ],
            '织锦': [
                ('云锦围巾', '南京云锦木机妆花手工织造，纹样华丽', 668, True, '南京云锦是中华四大名锦之首，元明清三朝御用贡品。', 'Nanjing Yunjin brocade scarf, hand-woven on wooden loom, imperial tribute textile'),
                ('壮锦抱枕', '广西壮锦工艺抱枕，几何纹样，色彩斑斓', 188, False, '壮锦是壮族传统手工织锦，已有一千年以上历史。', 'Zhuang brocade cushion cover, Guangxi traditional textile, geometric pattern'),
                ('蜀锦书签', '成都蜀锦书签，小巧精致，纹样古朴典雅', 78, True, '蜀锦有两千多年历史，是丝绸之路的重要商品。', 'Shu brocade bookmark, Chengdu ancient textile, elegant pattern, Silk Road heritage'),
            ],
            '木雕': [
                ('东阳木雕摆件', '浙江东阳木雕工艺摆件，镂空雕花，层次丰富', 458, False, '东阳木雕始于唐，盛于明清，被誉为国之瑰宝。', 'Dongyang wood carving ornament, Zhejiang openwork carving, layered floral design'),
                ('黄杨木雕观音', '乐清黄杨木雕观音像，材质细腻，雕工精湛', 688, True, '黄杨木雕木质细腻如象牙，生长缓慢，极其珍贵。', 'Yueqing boxwood carving of Guanyin, ivory-like texture, exquisite craftsmanship'),
                ('龙眼木雕茶宠', '福建龙眼木雕茶宠，造型可爱，盘玩越久越润', 128, False, '龙眼木雕是福建传统木雕品种，木质坚硬。', 'Longan wood carving tea pet, Fujian traditional craft, auspicious figurine'),
                ('樟木箱', '传统香樟木箱，防虫防蛀，精雕花卉图案', 568, True, '香樟木箱是中国传统嫁妆器具，兼具实用与观赏价值。', 'Camphor wood chest with carved floral design, traditional Chinese dowry furniture'),
            ],
        }
        count = 0
        for cat_name, items in products_data.items():
            cat = Category.objects.get(name=cat_name)
            for name, desc, price, customizable, story, prompt in items:
                Product.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': desc,
                        'price': price,
                        'category': cat,
                        'is_customizable': customizable,
                        'story': story,
                        'image': build_image_url(prompt),
                    }
                )
                count += 1
        self.stdout.write(f'创建{count}个商品')

    def _create_customize_templates(self):
        products = Product.objects.filter(is_customizable=True)
        count = 0
        for product in products:
            schema = {
                'fields': [
                    {'name': 'text', 'label': '刻字内容', 'type': 'text', 'max_length': 20},
                    {'name': 'color', 'label': '配色', 'type': 'select', 'options': ['经典红', '雅致金', '素雅白', '墨绿']},
                    {'name': 'pattern', 'label': '纹样', 'type': 'select', 'options': ['龙凤呈祥', '花开富贵', '福寿双全', '年年有余']},
                ]
            }
            CustomizeTemplate.objects.get_or_create(
                product=product,
                name=f'{product.name}个性化定制',
                defaults={'config_schema': schema}
            )
            count += 1
        self.stdout.write(f'创建{count}个定制模板')

    def _create_coupons(self):
        coupons = [
            ('新人满减券', 'full_reduction', 30, 200, 30),
            ('非遗匠心折扣券', 'discount', 85, 100, 15),
            ('满额立减券', 'full_reduction', 50, 500, 30),
            ('会员专享折扣', 'discount', 90, 0, 15),
            ('全场免邮券', 'free_shipping', 0, 0, 30),
        ]
        for name, ctype, discount, min_amount, days in coupons:
            Coupon.objects.get_or_create(
                name=name,
                defaults={
                    'coupon_type': ctype,
                    'discount': discount,
                    'min_amount': min_amount,
                    'expire_at': timezone.now() + timedelta(days=days),
                }
            )
        self.stdout.write(f'创建{len(coupons)}张优惠券')

    def _create_member_tasks(self):
        tasks = [
            ('每日签到', 'checkin', 10, 5, {'daily': True}),
            ('分享好友', 'share', 20, 10, {'count': 1}),
            ('首次购买', 'consume', 100, 50, {'first': True}),
            ('累计消费满500', 'consume', 200, 100, {'total_amount': 500}),
            ('邀请3位好友', 'share', 300, 150, {'invite_count': 3}),
        ]
        for name, task_type, points, growth, condition in tasks:
            MemberTask.objects.get_or_create(
                name=name,
                defaults={
                    'task_type': task_type,
                    'points_reward': points,
                    'growth_reward': growth,
                    'condition': condition,
                }
            )
        self.stdout.write(f'创建{len(tasks)}个会员任务')

    def _create_campaigns(self):
        now = timezone.now()
        campaigns = [
            ('非遗好物限时优惠', 'flash_sale', {'discount': 85, 'duration': '3days'}, now, now + timedelta(days=7)),
            ('匠心手作拼团特惠', 'group_buy', {'min_people': 3, 'discount': 80}, now, now + timedelta(days=14)),
        ]
        for title, ctype, rules, start, end in campaigns:
            Campaign.objects.get_or_create(
                title=title,
                defaults={
                    'campaign_type': ctype,
                    'rules': rules,
                    'start_at': start,
                    'end_at': end,
                    'is_active': True,
                }
            )
        self.stdout.write(f'创建{len(campaigns)}个营销活动')

    def _create_group_buys(self):
        campaign = Campaign.objects.filter(campaign_type='group_buy').first()
        if not campaign:
            return
        products = Product.objects.filter(is_active=True)[:2]
        for product in products:
            GroupBuy.objects.get_or_create(
                campaign=campaign,
                product=product,
                defaults={
                    'group_price': product.price * Decimal('0.8'),
                    'target_count': 3,
                    'current_count': 0,
                }
            )
        self.stdout.write(f'创建{len(products)}个拼团活动')

    def _create_demo_users(self):
        users = [
            ('张三', 'zhangsan'),
            ('李四', 'lisi'),
            ('王五', 'wangwu'),
        ]
        for display, username in users:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'first_name': display}
            )
            if created:
                user.set_password('test123456')
                user.save()
                MemberProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'invite_code': f'{username}_invite',
                        'level': 2 if username != 'wangwu' else 1,
                        'points': 200 if username != 'wangwu' else 50,
                        'growth_value': 100 if username != 'wangwu' else 30,
                    }
                )
        self.stdout.write(f'创建{len(users)}个演示用户')

    def _create_sample_behaviors(self):
        user = User.objects.get(username='zhangsan')
        products = Product.objects.filter(is_active=True)
        behaviors = [
            ('browse', 0), ('browse', 1), ('browse', 2),
            ('favorite', 0), ('favorite', 3),
            ('purchase', 1),
        ]
        for action, idx in behaviors:
            if idx < len(products):
                UserBehavior.objects.get_or_create(
                    user=user,
                    product=products[idx],
                    action_type=action,
                )
        preference, _ = UserPreference.objects.get_or_create(user=user)
        for behavior in UserBehavior.objects.filter(user=user):
            weight = {'browse': 1, 'favorite': 2, 'purchase': 3}.get(behavior.action_type, 1)
            cat_id = str(behavior.product.category_id)
            current = preference.category_weights.get(cat_id, 0)
            preference.category_weights[cat_id] = current + weight
        preference.save()

        user2 = User.objects.get(username='lisi')
        behaviors2 = [
            ('browse', 3), ('browse', 4), ('favorite', 4), ('purchase', 3), ('purchase', 5),
        ]
        for action, idx in behaviors2:
            if idx < len(products):
                UserBehavior.objects.get_or_create(
                    user=user2,
                    product=products[idx],
                    action_type=action,
                )
        preference2, _ = UserPreference.objects.get_or_create(user=user2)
        for behavior in UserBehavior.objects.filter(user=user2):
            weight = {'browse': 1, 'favorite': 2, 'purchase': 3}.get(behavior.action_type, 1)
            cat_id = str(behavior.product.category_id)
            current = preference2.category_weights.get(cat_id, 0)
            preference2.category_weights[cat_id] = current + weight
        preference2.save()

        self.stdout.write('创建示例行为数据')
