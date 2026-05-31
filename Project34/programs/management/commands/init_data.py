from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, time
from programs.models import Program, Schedule, PlayRecord, Submission


class Command(BaseCommand):
    help = 'Initialize sample data for the radio station system'

    def handle(self, *args, **options):
        self.stdout.write('Starting data initialization...')

        programs_data = [
            {
                'name': '晨间新闻',
                'host': '张主播',
                'category': 'news',
                'description': '每天早晨为您带来最新的校园新闻和国内外重要资讯，让您第一时间了解世界动态。',
                'duration': 30,
                'status': 'active',
            },
            {
                'name': '音乐下午茶',
                'host': '李主播',
                'category': 'music',
                'description': '午后时光，精选优美音乐陪伴您度过悠闲的下午，接受同学们的歌曲点播。',
                'duration': 45,
                'status': 'active',
            },
            {
                'name': '校园访谈',
                'host': '王主播',
                'category': 'talk',
                'description': '邀请校园优秀师生进行访谈，分享他们的故事和经验。',
                'duration': 40,
                'status': 'active',
            },
            {
                'name': '故事城堡',
                'host': '刘主播',
                'category': 'story',
                'description': '讲述精彩的故事，带你进入奇妙的想象世界。',
                'duration': 25,
                'status': 'active',
            },
            {
                'name': '英语角',
                'host': '陈主播',
                'category': 'education',
                'description': '学习英语的好帮手，提升英语听说能力。',
                'duration': 30,
                'status': 'active',
            },
            {
                'name': '娱乐先锋',
                'host': '赵主播',
                'category': 'entertainment',
                'description': '最新娱乐资讯，热门话题讨论。',
                'duration': 35,
                'status': 'inactive',
            },
        ]

        programs = []
        for prog_data in programs_data:
            program, created = Program.objects.get_or_create(
                name=prog_data['name'],
                defaults=prog_data
            )
            if created:
                self.stdout.write(f'Created program: {program.name}')
            programs.append(program)

        schedules_data = [
            {'program': programs[0], 'weekday': 1, 'start_time': time(7, 30), 'end_time': time(8, 0)},
            {'program': programs[0], 'weekday': 2, 'start_time': time(7, 30), 'end_time': time(8, 0)},
            {'program': programs[0], 'weekday': 3, 'start_time': time(7, 30), 'end_time': time(8, 0)},
            {'program': programs[0], 'weekday': 4, 'start_time': time(7, 30), 'end_time': time(8, 0)},
            {'program': programs[0], 'weekday': 5, 'start_time': time(7, 30), 'end_time': time(8, 0)},
            {'program': programs[1], 'weekday': 1, 'start_time': time(14, 0), 'end_time': time(14, 45)},
            {'program': programs[1], 'weekday': 3, 'start_time': time(14, 0), 'end_time': time(14, 45)},
            {'program': programs[1], 'weekday': 5, 'start_time': time(14, 0), 'end_time': time(14, 45)},
            {'program': programs[2], 'weekday': 2, 'start_time': time(16, 0), 'end_time': time(16, 40)},
            {'program': programs[2], 'weekday': 4, 'start_time': time(16, 0), 'end_time': time(16, 40)},
            {'program': programs[3], 'weekday': 1, 'start_time': time(18, 0), 'end_time': time(18, 25)},
            {'program': programs[3], 'weekday': 3, 'start_time': time(18, 0), 'end_time': time(18, 25)},
            {'program': programs[3], 'weekday': 5, 'start_time': time(18, 0), 'end_time': time(18, 25)},
            {'program': programs[4], 'weekday': 2, 'start_time': time(17, 0), 'end_time': time(17, 30)},
            {'program': programs[4], 'weekday': 4, 'start_time': time(17, 0), 'end_time': time(17, 30)},
        ]

        for sched_data in schedules_data:
            Schedule.objects.get_or_create(
                program=sched_data['program'],
                weekday=sched_data['weekday'],
                start_time=sched_data['start_time'],
                defaults={'end_time': sched_data['end_time'], 'is_active': True}
            )
        self.stdout.write('Created schedules')

        today = date.today()
        records_data = [
            {'program': programs[0], 'play_date': today, 'start_time': time(7, 30), 'end_time': time(8, 0), 'host': '张主播', 'listeners_count': 150},
            {'program': programs[1], 'play_date': today, 'start_time': time(14, 0), 'end_time': time(14, 45), 'host': '李主播', 'listeners_count': 200},
            {'program': programs[0], 'play_date': date.fromordinal(today.toordinal()-1), 'start_time': time(7, 30), 'end_time': time(8, 0), 'host': '张主播', 'listeners_count': 145},
            {'program': programs[2], 'play_date': date.fromordinal(today.toordinal()-1), 'start_time': time(16, 0), 'end_time': time(16, 40), 'host': '王主播', 'listeners_count': 120},
            {'program': programs[3], 'play_date': date.fromordinal(today.toordinal()-2), 'start_time': time(18, 0), 'end_time': time(18, 25), 'host': '刘主播', 'listeners_count': 180},
        ]

        for rec_data in records_data:
            PlayRecord.objects.get_or_create(
                program=rec_data['program'],
                play_date=rec_data['play_date'],
                start_time=rec_data['start_time'],
                defaults={
                    'end_time': rec_data['end_time'],
                    'host': rec_data['host'],
                    'listeners_count': rec_data['listeners_count'],
                }
            )
        self.stdout.write('Created play records')

        submissions_data = [
            {'title': '献给同桌的生日祝福', 'submitter_name': '小明', 'submitter_class': '高一(1)班', 'submission_type': 'blessing', 'content': '祝我的同桌生日快乐，学业进步！', 'contact': '13800138001', 'status': 'approved'},
            {'title': '点播《晴天》', 'submitter_name': '小红', 'submitter_class': '高二(3)班', 'submission_type': 'song', 'content': '想点播周杰伦的《晴天》，送给全班同学。', 'contact': '13800138002', 'status': 'pending'},
            {'title': '我的校园生活', 'submitter_name': '小华', 'submitter_class': '高三(2)班', 'submission_type': 'article', 'content': '时光飞逝，转眼间高中三年即将过去...', 'contact': '13800138003', 'status': 'approved'},
            {'title': '感人的励志故事', 'submitter_name': '小李', 'submitter_class': '高一(5)班', 'submission_type': 'story', 'content': '这是一个关于坚持与梦想的故事...', 'contact': '13800138004', 'status': 'pending'},
            {'title': '感恩节祝福', 'submitter_name': '小王', 'submitter_class': '高二(1)班', 'submission_type': 'blessing', 'content': '感谢老师们的辛勤付出，您们辛苦了！', 'contact': '13800138005', 'status': 'broadcast'},
        ]

        for sub_data in submissions_data:
            Submission.objects.get_or_create(
                title=sub_data['title'],
                submitter_name=sub_data['submitter_name'],
                defaults=sub_data
            )
        self.stdout.write('Created submissions')

        self.stdout.write(self.style.SUCCESS('Data initialization completed successfully!'))
