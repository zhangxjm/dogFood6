import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Input, Select, Tag, Empty } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { Course } from '../types';

const { Search } = Input;
const { Option } = Select;

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchText, categoryFilter, statusFilter, courses]);

  const loadCourses = async () => {
    try {
      const data = await courseAPI.getAll();
      setCourses(data);
      setFilteredCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];
    
    if (searchText) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchText.toLowerCase()) ||
        c.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    
    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    setFilteredCourses(filtered);
  };

  const categories = Array.from(new Set(courses.map(c => c.category)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'blue';
      case 'ongoing': return 'green';
      case 'completed': return 'gray';
      case 'draft': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'ongoing': return 'Ongoing';
      case 'completed': return 'Completed';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Search
          placeholder="Search courses..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ width: 300 }}
          onSearch={(value) => setSearchText(value)}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="Select category"
          allowClear
          size="large"
          style={{ width: 200 }}
          onChange={(value) => setCategoryFilter(value || '')}
        >
          {categories.map((cat) => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>
        <Select
          placeholder="Select status"
          allowClear
          size="large"
          style={{ width: 150 }}
          onChange={(value) => setStatusFilter(value || '')}
        >
          <Option value="published">Published</Option>
          <Option value="ongoing">Ongoing</Option>
          <Option value="completed">Completed</Option>
          <Option value="draft">Draft</Option>
        </Select>
      </div>

      {filteredCourses.length === 0 ? (
        <Empty description="No courses available" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCourses.map((course) => (
            <Col xs={24} sm={12} lg={8} key={course.id}>
              <Card
                hoverable
                className="card-hover"
                cover={
                  <div style={{ height: 180, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 48 }}>
                    <BookOutlined />
                  </div>
                }
                actions={[
                  <Button type="link" onClick={() => navigate('/courses/' + course.id)}>View Details</Button>,
                  course.status === 'ongoing' && (
                    <Button type="primary" onClick={() => navigate('/live/' + course.id)}>Enter Live</Button>
                  ),
                ].filter(Boolean)}
              >
                <Card.Meta
                  title={course.title}
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color="blue">{course.category}</Tag>
                        <Tag color={getStatusColor(course.status)}>{getStatusText(course.status)}</Tag>
                      </div>
                      <p style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>
                        {course.description.length > 60 ? course.description.slice(0, 60) + '...' : course.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: 12 }}>
                        <span>Instructor: {course.teacher?.name || 'N/A'}</span>
                        <span>{course.currentStudents}/{course.maxStudents} students</span>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Courses;
