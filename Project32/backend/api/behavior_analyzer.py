import random
import time
from .models import BehaviorType


class BehaviorAnalyzer:
    def __init__(self):
        self.behaviors = list(BehaviorType.objects.all())

    def analyze_video(self, video_id):
        if not self.behaviors:
            self.behaviors = list(BehaviorType.objects.all())
        
        time.sleep(2)
        
        results = []
        num_behaviors = random.randint(1, 5)
        
        for _ in range(num_behaviors):
            behavior = random.choice(self.behaviors)
            start_time = random.uniform(0, 30)
            duration = random.uniform(2, 10)
            
            results.append({
                'video_id': video_id,
                'behavior_code': behavior.code,
                'confidence': round(random.uniform(0.7, 0.99), 2),
                'start_time': round(start_time, 2),
                'end_time': round(start_time + duration, 2)
            })
        
        return results


class TrainingRecommender:
    def __init__(self):
        pass

    def generate_recommendation(self, pet_id, behaviors):
        negative_behaviors = [b for b in behaviors if b.get('is_negative', False)]
        
        if not negative_behaviors:
            return {
                'title': '基础行为巩固训练',
                'description': '您的宠物表现良好，继续保持日常训练，巩固良好行为习惯。',
                'difficulty': 'easy',
                'duration_days': 14,
                'target_codes': ['SIT', 'COME', 'STAY'],
                'steps': [
                    {'order': 1, 'title': '每日基础训练', 'instruction': '每天进行10分钟的基础服从训练，包括坐下、过来和停留指令。', 'duration': 10, 'tips': '使用宠物喜欢的零食作为奖励，保持耐心和一致性。'},
                    {'order': 2, 'title': '社交化练习', 'instruction': '带宠物外出接触其他宠物和人类，增强社交能力。', 'duration': 15, 'tips': '选择安静的环境开始，逐渐增加难度。'},
                ]
            }
        
        severity = sum(b.get('severity', 1) for b in negative_behaviors)
        
        if severity > 5:
            return {
                'title': '行为矫正强化训练',
                'description': '针对检测到的不良行为，制定强化矫正训练计划，帮助宠物建立正确的行为模式。',
                'difficulty': 'hard',
                'duration_days': 45,
                'target_codes': [b.get('code') for b in negative_behaviors],
                'steps': [
                    {'order': 1, 'title': '行为识别与记录', 'instruction': '仔细观察并记录宠物不良行为发生的场景和触发因素。', 'duration': 20, 'tips': '使用视频记录帮助分析行为模式。'},
                    {'order': 2, 'title': '环境调整', 'instruction': '根据分析结果，调整宠物的生活环境，减少诱发不良行为的因素。', 'duration': 15, 'tips': '提供充足的玩具和活动空间。'},
                    {'order': 3, 'title': '替代行为训练', 'instruction': '教导宠物用正确的行为替代不良行为，每次正确表现给予奖励。', 'duration': 15, 'tips': '及时奖励是关键，不要等到行为结束才奖励。'},
                    {'order': 4, 'title': '渐进式暴露训练', 'instruction': '逐步让宠物接触触发因素，在控制环境中练习正确反应。', 'duration': 20, 'tips': '从低强度开始，逐渐增加难度，不要急于求成。'},
                ]
            }
        else:
            return {
                'title': '轻度行为调整训练',
                'description': '针对轻微的不良行为倾向，进行预防性训练，防止问题加重。',
                'difficulty': 'medium',
                'duration_days': 30,
                'target_codes': [b.get('code') for b in negative_behaviors],
                'steps': [
                    {'order': 1, 'title': '日常互动增加', 'instruction': '增加与宠物的互动时间，建立更强的信任关系。', 'duration': 15, 'tips': '每天安排专门的游戏和抚摸时间。'},
                    {'order': 2, 'title': '基本服从训练', 'instruction': '复习并巩固基本的服从指令，建立沟通基础。', 'duration': 10, 'tips': '每次训练时间不宜过长，但要保持频率。'},
                    {'order': 3, 'title': '行为引导', 'instruction': '当发现不良行为苗头时，立即用正面引导转移注意力。', 'duration': 10, 'tips': '不要惩罚，要用正面强化。'},
                ]
            }
