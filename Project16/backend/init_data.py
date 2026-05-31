import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pet_med_ai.settings')
django.setup()

from django.contrib.auth import get_user_model


def init_data():
    User = get_user_model()

    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@petmedai.com',
            password='admin123',
            role='admin',
            first_name='系统',
            last_name='管理员'
        )
        print(f"Created admin user: {admin.username}")

    if not User.objects.filter(username='doctor').exists():
        doctor = User.objects.create_user(
            username='doctor',
            email='doctor@petmedai.com',
            password='doctor123',
            role='doctor',
            first_name='张',
            last_name='医生',
            department='宠物内科',
            phone='13800138000'
        )
        print(f"Created doctor user: {doctor.username}")

    if not User.objects.filter(username='assistant').exists():
        assistant = User.objects.create_user(
            username='assistant',
            email='assistant@petmedai.com',
            password='assistant123',
            role='assistant',
            first_name='李',
            last_name='助理',
            department='影像科',
            phone='13900139000'
        )
        print(f"Created assistant user: {assistant.username}")

    from pets.models import Pet
    doctor = User.objects.get(username='doctor')

    if not Pet.objects.filter(name='旺财').exists():
        pet1 = Pet.objects.create(
            owner=doctor,
            name='旺财',
            species='dog',
            breed='金毛犬',
            gender='male',
            age=36,
            weight=25.5,
            color='金色',
            description='活泼好动，喜欢玩球'
        )
        print(f"Created pet: {pet1.name}")

    if not Pet.objects.filter(name='咪咪').exists():
        pet2 = Pet.objects.create(
            owner=doctor,
            name='咪咪',
            species='cat',
            breed='英国短毛猫',
            gender='female',
            age=24,
            weight=4.2,
            color='灰色',
            description='温顺安静，喜欢睡觉'
        )
        print(f"Created pet: {pet2.name}")

    print("Data initialization completed!")


if __name__ == '__main__':
    init_data()
