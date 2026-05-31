import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { User } from './entities/user.entity';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Document } from './entities/document.entity';

const defaultUsers = [
  { username: 'admin', password: '123456', nickname: '系统管理员' },
  { username: 'zhangsan', password: '123456', nickname: '张三' },
  { username: 'lisi', password: '123456', nickname: '李四' },
  { username: 'wangwu', password: '123456', nickname: '王五' },
  { username: 'zhaoliu', password: '123456', nickname: '赵六' },
];

const defaultRooms = [
  { name: '主会议室', description: '大型会议专用，支持20人同时在线', type: 'meeting', maxCapacity: 20 },
  { name: '产品讨论室', description: '产品需求讨论与评审', type: 'meeting', maxCapacity: 10 },
  { name: '技术研发中心', description: '技术团队日常协作空间', type: 'office', maxCapacity: 15 },
  { name: '培训大讲堂', description: '用于培训和演讲活动', type: 'presentation', maxCapacity: 30 },
  { name: '休闲大厅', description: '放松交流，非正式沟通', type: 'lobby', maxCapacity: 50 },
  { name: '小组讨论室A', description: '小型团队讨论', type: 'meeting', maxCapacity: 6 },
  { name: '小组讨论室B', description: '小型团队讨论', type: 'meeting', maxCapacity: 6 },
];

const defaultDocuments = [
  { title: '2024年度工作计划', type: 'document', content: '# 2024年度工作计划\n\n## 一、工作目标\n\n1. 完成产品迭代升级\n2. 提升用户体验\n3. 拓展市场份额\n\n## 二、重点项目\n\n- 元宇宙办公系统开发\n- 移动端适配\n- 性能优化' },
  { title: '产品需求文档', type: 'document', content: '# 产品需求文档\n\n## 功能需求\n\n1. 用户管理\n2. 虚拟会议室\n3. 文档协同\n4. 桌面共享\n\n## 非功能需求\n\n- 响应时间 < 200ms\n- 支持 100+ 并发用户' },
  { title: '技术架构设计', type: 'document', content: '# 技术架构设计\n\n## 前端技术栈\n- SolidJS\n- TypeScript\n- WebRTC\n\n## 后端技术栈\n- NestJS\n- Socket.io\n- SQLite\n\n## 部署架构\n- Docker 容器化\n- Nginx 反向代理' },
  { title: '项目进度跟踪表', type: 'spreadsheet', content: '| 任务名称 | 负责人 | 进度 | 截止日期 |\n|---------|--------|------|----------|\n| 需求分析 | 张三 | 100% | 2024-01-15 |\n| 系统设计 | 李四 | 100% | 2024-01-30 |\n| 前端开发 | 王五 | 75% | 2024-02-28 |\n| 后端开发 | 赵六 | 80% | 2024-02-28 |\n| 测试上线 | 全体 | 0% | 2024-03-15 |' },
];

function generateAvatar(name: string): string {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const initial = name.charAt(0).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${colors[colorIndex]}"/><text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-size="32" font-family="Arial">${initial}</text></svg>`)}`;
}

async function seed() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get(getRepositoryToken(User));
  const roomRepository = app.get(getRepositoryToken(MeetingRoom));
  const documentRepository = app.get(getRepositoryToken(Document));

  const existingUsers = await userRepository.count();
  if (existingUsers === 0) {
    console.log('Seeding default users...');
    for (const userData of defaultUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
        avatar: generateAvatar(userData.nickname),
        status: 'offline',
      });
      await userRepository.save(user);
    }
    console.log(`Created ${defaultUsers.length} default users`);
  } else {
    console.log('Users already exist, skipping...');
  }

  const existingRooms = await roomRepository.count();
  if (existingRooms === 0) {
    console.log('Seeding default meeting rooms...');
    for (const roomData of defaultRooms) {
      const room = roomRepository.create({
        ...roomData,
        status: 'active',
        sceneData: JSON.stringify({
          theme: 'modern',
          color: '#1890ff',
          layout: 'conference',
        }),
      });
      await roomRepository.save(room);
    }
    console.log(`Created ${defaultRooms.length} default meeting rooms`);
  } else {
    console.log('Rooms already exist, skipping...');
  }

  const users = await userRepository.find();
  const existingDocs = await documentRepository.count();
  if (existingDocs === 0 && users.length > 0) {
    console.log('Seeding default documents...');
    for (let i = 0; i < defaultDocuments.length; i++) {
      const docData = defaultDocuments[i];
      const creator = users[i % users.length];
      const doc = documentRepository.create({
        ...docData,
        creatorId: creator.id,
      });
      await documentRepository.save(doc);
    }
    console.log(`Created ${defaultDocuments.length} default documents`);
  } else {
    console.log('Documents already exist, skipping...');
  }

  console.log('Seed completed successfully!');
  console.log('Default accounts:');
  for (const user of defaultUsers) {
    console.log(`  - ${user.username} / ${user.password} (${user.nickname})`);
  }

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
