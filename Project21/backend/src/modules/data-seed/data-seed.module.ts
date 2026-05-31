import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { Course } from '../course/course.entity';
import { Courseware } from '../courseware/courseware.entity';
import { Certificate } from '../certificate/certificate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Course, Courseware, Certificate])],
})
export class DataSeedModule implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Courseware)
    private coursewareRepository: Repository<Courseware>,
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
    await this.seedCourses();
    await this.seedCoursewares();
    await this.seedCertificates();
    console.log('Data seeding completed!');
  }

  private async seedUsers() {
    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) return;

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = [
      { username: 'admin', password: hashedPassword, name: '系统管理员', role: 'admin' as const, email: 'admin@heritage.com', phone: '13800000001' },
      { username: 'teacher', password: await bcrypt.hash('teacher123', 10), name: '李老师', role: 'teacher' as const, email: 'teacher@heritage.com', phone: '13800000002' },
      { username: 'student', password: await bcrypt.hash('student123', 10), name: '王同学', role: 'student' as const, email: 'student@heritage.com', phone: '13800000003' },
      { username: 'teacher2', password: await bcrypt.hash('teacher123', 10), name: '张老师', role: 'teacher' as const, email: 'teacher2@heritage.com', phone: '13800000004' },
      { username: 'student2', password: await bcrypt.hash('student123', 10), name: '刘同学', role: 'student' as const, email: 'student2@heritage.com', phone: '13800000005' },
    ];

    await this.userRepository.save(users);
    console.log('Users seeded!');
  }

  private async seedCourses() {
    const existingCourses = await this.courseRepository.count();
    if (existingCourses > 0) return;

    const courses = [
      {
        title: '京剧脸谱艺术入门',
        description: '本课程将带领学员了解京剧脸谱的历史渊源、色彩含义、绘制技巧等知识，通过实践操作掌握基本的脸谱绘制方法。',
        category: '传统戏剧',
        duration: 120,
        status: 'published' as const,
        teacherId: 2,
        maxStudents: 30,
        currentStudents: 15,
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        customFields: { level: '初级', location: '线上直播' },
      },
      {
        title: '中国书法基础教程',
        description: '从毛笔握法、基本笔画开始，系统学习楷书、行书等书体的书写技巧，感受中国书法的艺术魅力。',
        category: '书法艺术',
        duration: 180,
        status: 'ongoing' as const,
        teacherId: 4,
        maxStudents: 25,
        currentStudents: 20,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        customFields: { level: '初级', location: '线上直播' },
      },
      {
        title: '剪纸艺术创作',
        description: '学习传统剪纸的基本技法，创作属于自己的剪纸作品，了解剪纸艺术的文化内涵。',
        category: '民间工艺',
        duration: 90,
        status: 'published' as const,
        teacherId: 2,
        maxStudents: 20,
        currentStudents: 8,
        startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        customFields: { level: '初级', location: '线上直播' },
      },
      {
        title: '茶文化与茶艺',
        description: '深入了解中国茶文化的历史发展，学习六大茶类的特点及茶艺表演的基本技巧。',
        category: '传统技艺',
        duration: 150,
        status: 'completed' as const,
        teacherId: 4,
        maxStudents: 15,
        currentStudents: 12,
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        customFields: { level: '中级', location: '线上直播' },
      },
      {
        title: '古建筑榫卯结构解析',
        description: '探索中国古代建筑的智慧，了解榫卯结构的原理和应用，动手制作简单的榫卯模型。',
        category: '传统建筑',
        duration: 240,
        status: 'draft' as const,
        teacherId: 2,
        maxStudents: 10,
        currentStudents: 0,
        customFields: { level: '高级', location: '线上直播' },
      },
    ];

    await this.courseRepository.save(courses);
    console.log('Courses seeded!');
  }

  private async seedCoursewares() {
    const existingCoursewares = await this.coursewareRepository.count();
    if (existingCoursewares > 0) return;

    const coursewares = [
      {
        title: '京剧脸谱历史介绍.pdf',
        description: '详细介绍京剧脸谱的发展历史和文化背景',
        type: 'document' as const,
        fileName: '京剧脸谱历史介绍.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        minioBucket: 'heritage-courseware',
        minioObject: '1/history.pdf',
        fileUrl: '',
        courseId: 1,
      },
      {
        title: '脸谱色彩含义说明.docx',
        description: '不同颜色脸谱所代表的人物性格和身份',
        type: 'document' as const,
        fileName: '脸谱色彩含义说明.docx',
        fileSize: 1024000,
        mimeType: 'application/msword',
        minioBucket: 'heritage-courseware',
        minioObject: '1/colors.docx',
        fileUrl: '',
        courseId: 1,
      },
      {
        title: '书法基本笔画教学视频.mp4',
        description: '楷书基本笔画的书写示范视频',
        type: 'video' as const,
        fileName: '书法基本笔画教学视频.mp4',
        fileSize: 102400000,
        mimeType: 'video/mp4',
        minioBucket: 'heritage-courseware',
        minioObject: '2/basic-strokes.mp4',
        fileUrl: '',
        courseId: 2,
      },
      {
        title: '剪纸入门图案集.png',
        description: '初学者适用的剪纸图案参考集',
        type: 'image' as const,
        fileName: '剪纸入门图案集.png',
        fileSize: 5120000,
        mimeType: 'image/png',
        minioBucket: 'heritage-courseware',
        minioObject: '3/patterns.png',
        fileUrl: '',
        courseId: 3,
      },
    ];

    await this.coursewareRepository.save(coursewares);
    console.log('Coursewares seeded!');
  }

  private async seedCertificates() {
    const existingCertificates = await this.certificateRepository.count();
    if (existingCertificates > 0) return;

    const certificates = [
      {
        certificateNumber: 'CERT-2024-HERITAGE-0001',
        title: '茶文化与茶艺结业证书',
        content: '兹证明 王同学 已完成《茶文化与茶艺》课程学习，考核合格，特发此证。',
        userId: 3,
        courseId: 4,
        issueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isValid: true,
      },
      {
        certificateNumber: 'CERT-2024-HERITAGE-0002',
        title: '中国书法基础结业证书',
        content: '兹证明 刘同学 已完成《中国书法基础教程》课程学习，考核合格，特发此证。',
        userId: 5,
        courseId: 2,
        issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isValid: true,
      },
    ];

    await this.certificateRepository.save(certificates);
    console.log('Certificates seeded!');
  }
}
