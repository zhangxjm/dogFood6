export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export type CourseStatus = 'draft' | 'published' | 'ongoing' | 'completed';

export interface Course {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  category: string;
  duration: number;
  status: CourseStatus;
  startTime?: string;
  endTime?: string;
  maxStudents: number;
  currentStudents: number;
  teacherId: number;
  teacher?: User;
  coursewares?: Courseware[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type CoursewareType = 'document' | 'video' | 'audio' | 'image' | 'other';

export interface Courseware {
  id: number;
  title: string;
  description?: string;
  type: CoursewareType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  minioBucket: string;
  minioObject: string;
  fileUrl?: string;
  courseId: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: number;
  certificateNumber: string;
  title: string;
  content: string;
  userId: number;
  user?: User;
  courseId: number;
  course?: Course;
  issueDate: string;
  validUntil?: string;
  isValid: boolean;
  certificateUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}
