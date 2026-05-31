from django.core.management.base import BaseCommand
from api.models import BehaviorType, Pet


class Command(BaseCommand):
    help = 'Initialize default data for the system'

    def handle(self, *args, **options):
        self.stdout.write('Initializing default data...')

        behavior_types = [
            {
                'code': 'SIT',
                'name': '坐下',
                'description': '宠物做出坐下的动作，表现出服从性。',
                'is_negative': False,
                'severity_level': 1
            },
            {
                'code': 'STAY',
                'name': '停留',
                'description': '宠物在原地保持不动，等待指令。',
                'is_negative': False,
                'severity_level': 1
            },
            {
                'code': 'COME',
                'name': '过来',
                'description': '宠物听到呼唤后向主人靠近。',
                'is_negative': False,
                'severity_level': 1
            },
            {
                'code': 'WALK',
                'name': '行走',
                'description': '宠物正常行走的状态。',
                'is_negative': False,
                'severity_level': 1
            },
            {
                'code': 'RUN',
                'name': '奔跑',
                'description': '宠物快速奔跑的状态。',
                'is_negative': False,
                'severity_level': 1
            },
            {
                'code': 'PLAY',
                'name': '玩耍',
                'description': '宠物与玩具或其他宠物互动玩耍。',
                'is_negative': False,
                'severity_level': 1
            },
            {
                'code': 'EAT',
                'name': '进食',
                'description': '宠物正在吃东西。',
                'is_negative': False,
                'severity_level': 1
            },
            {
                'code': 'SLEEP',
                'name': '睡觉',
                'description': '宠物正在休息或睡觉。',
                'is_negative': False,
                'severity_level': 1
            },
            {
                'code': 'BARK',
                'name': '吠叫',
                'description': '宠物持续吠叫，可能表示焦虑或警觉。',
                'is_negative': True,
                'severity_level': 2
            },
            {
                'code': 'JUMP',
                'name': '扑人',
                'description': '宠物向人跳跃，可能造成不适或危险。',
                'is_negative': True,
                'severity_level': 2
            },
            {
                'code': 'BITING',
                'name': '咬东西',
                'description': '宠物啃咬家具或其他不该咬的物品。',
                'is_negative': True,
                'severity_level': 3
            },
            {
                'code': 'AGGRESSION',
                'name': '攻击行为',
                'description': '宠物表现出攻击性姿态或动作。',
                'is_negative': True,
                'severity_level': 5
            },
            {
                'code': 'FEAR',
                'name': '恐惧反应',
                'description': '宠物表现出害怕、退缩的行为。',
                'is_negative': True,
                'severity_level': 2
            },
            {
                'code': 'ANXIETY',
                'name': '焦虑不安',
                'description': '宠物表现出焦躁、来回踱步等焦虑症状。',
                'is_negative': True,
                'severity_level': 3
            },
            {
                'code': 'CHASING',
                'name': '追逐',
                'description': '宠物追逐其他动物或移动物体。',
                'is_negative': True,
                'severity_level': 2
            },
        ]

        created_count = 0
        for bt in behavior_types:
            if not BehaviorType.objects.filter(code=bt['code']).exists():
                BehaviorType.objects.create(**bt)
                created_count += 1

        self.stdout.write(f'Created {created_count} behavior types.')

        sample_pets = [
            {
                'name': '旺财',
                'species': '狗',
                'breed': '金毛寻回犬',
                'age': 3,
                'weight': 28.5
            },
            {
                'name': '咪咪',
                'species': '猫',
                'breed': '英国短毛猫',
                'age': 2,
                'weight': 5.2
            },
        ]

        created_pets = 0
        for pet in sample_pets:
            if not Pet.objects.filter(name=pet['name']).exists():
                Pet.objects.create(**pet)
                created_pets += 1

        self.stdout.write(f'Created {created_pets} sample pets.')
        self.stdout.write('Data initialization completed!')
