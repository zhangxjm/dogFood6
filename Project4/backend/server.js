const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { db } = require('./database');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.json({ message: 'Error Notebook System API', status: 'running' });
});

function getSubjectName(id) {
  const subject = db.getById('subjects', id);
  return subject ? subject.name : '';
}

function getCategoryName(id) {
  const category = db.getById('categories', id);
  return category ? category.name : '';
}

function getKnowledgePointName(id) {
  const kp = db.getById('knowledge_points', id);
  return kp ? kp.name : '';
}

function formatQuestion(q) {
  return {
    ...q,
    subject: q.subject_id ? { id: q.subject_id, name: getSubjectName(q.subject_id) } : null,
    knowledge_point: q.knowledge_point_id ? { id: q.knowledge_point_id, name: getKnowledgePointName(q.knowledge_point_id) } : null,
    category: q.category_id ? { id: q.category_id, name: getCategoryName(q.category_id) } : null
  };
}

app.get('/api/subjects', (req, res) => {
  try {
    const subjects = db.getAll('subjects');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subjects', (req, res) => {
  try {
    const [subject] = db.findOrCreate('subjects', { name: req.body.name }, req.body);
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/knowledge-points', (req, res) => {
  try {
    const { subject_id } = req.query;
    const where = {};
    if (subject_id) where.subject_id = parseInt(subject_id);
    const points = db.findAll('knowledge_points', where);
    res.json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/knowledge-points', (req, res) => {
  try {
    const [point] = db.findOrCreate('knowledge_points', {
      name: req.body.name,
      subject_id: req.body.subject_id
    }, req.body);
    res.json(point);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getAll('categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const [category] = db.findOrCreate('categories', { name: req.body.name }, req.body);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/questions', (req, res) => {
  try {
    const { subject_id, category_id, knowledge_point_id, need_practice } = req.query;
    let questions = db.getAll('questions');
    
    if (subject_id) {
      questions = questions.filter(q => q.subject_id === parseInt(subject_id));
    }
    if (category_id) {
      questions = questions.filter(q => q.category_id === parseInt(category_id));
    }
    if (knowledge_point_id) {
      questions = questions.filter(q => q.knowledge_point_id === parseInt(knowledge_point_id));
    }
    if (need_practice === 'true') {
      const now = new Date();
      questions = questions.filter(q => {
        if (!q.next_practice_at) return true;
        return new Date(q.next_practice_at) <= now;
      });
    }
    
    questions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(questions.map(formatQuestion));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/questions', (req, res) => {
  try {
    const question = db.create('questions', {
      ...req.body,
      error_count: 1,
      mastery_level: 0,
      next_practice_at: new Date().toISOString()
    });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/questions/:id', (req, res) => {
  try {
    const question = db.getById('questions', parseInt(req.params.id));
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(formatQuestion(question));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/questions/:id', (req, res) => {
  try {
    const question = db.update('questions', parseInt(req.params.id), req.body);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/questions/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const question = db.getById('questions', id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    db.deleteByField('practice_records', 'question_id', id);
    db.delete('questions', id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/practice/random', (req, res) => {
  try {
    const { subject_id } = req.query;
    const now = new Date();
    let questions = db.getAll('questions').filter(q => {
      if (!q.next_practice_at) return true;
      return new Date(q.next_practice_at) <= now;
    });
    
    if (subject_id) {
      questions = questions.filter(q => q.subject_id === parseInt(subject_id));
    }
    
    if (questions.length === 0) {
      return res.json(null);
    }
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    res.json(formatQuestion(randomQuestion));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/practice/submit', (req, res) => {
  try {
    const { question_id, is_correct, user_answer } = req.body;
    const record = db.create('practice_records', { question_id, is_correct, user_answer });

    const question = db.getById('questions', question_id);
    if (question) {
      const updates = {
        error_count: (question.error_count || 0) + 1
      };
      
      if (is_correct) {
        updates.mastery_level = Math.min((question.mastery_level || 0) + 1, 3);
      } else {
        updates.mastery_level = 0;
      }
      
      const now = new Date();
      updates.last_practice_at = now.toISOString();
      
      if (updates.mastery_level === 0) {
        updates.next_practice_at = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
      } else if (updates.mastery_level === 1) {
        updates.next_practice_at = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      } else if (updates.mastery_level === 2) {
        updates.next_practice_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        updates.next_practice_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
      
      db.update('questions', question_id, updates);
    }
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/practice/records', (req, res) => {
  try {
    const { question_id } = req.query;
    let records = db.getAll('practice_records');
    if (question_id) {
      records = records.filter(r => r.question_id === parseInt(question_id));
    }
    records.sort((a, b) => new Date(b.practiced_at) - new Date(a.practiced_at));
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/statistics', (req, res) => {
  try {
    const questions = db.getAll('questions');
    const total_questions = questions.length;
    const total_subjects = db.getAll('subjects').length;
    const total_practices = db.getAll('practice_records').length;
    
    const mastery_0 = questions.filter(q => q.mastery_level === 0).length;
    const mastery_1 = questions.filter(q => q.mastery_level === 1).length;
    const mastery_2 = questions.filter(q => q.mastery_level === 2).length;
    const mastery_3 = questions.filter(q => q.mastery_level >= 3).length;
    
    res.json({
      total_questions,
      total_subjects,
      total_practices,
      mastery_0,
      mastery_1,
      mastery_2,
      mastery_3
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/review/by-category', (req, res) => {
  try {
    const categories = db.getAll('categories');
    const result = categories.map(cat => {
      const questions = db.findAll('questions', { category_id: cat.id });
      return {
        category_id: cat.id,
        category_name: cat.name,
        question_count: questions.length,
        questions: questions.map(q => ({
          id: q.id,
          title: q.title,
          mastery_level: q.mastery_level,
          error_count: q.error_count
        }))
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/review/by-subject', (req, res) => {
  try {
    const subjects = db.getAll('subjects');
    const result = subjects.map(sub => {
      const questions = db.findAll('questions', { subject_id: sub.id });
      return {
        subject_id: sub.id,
        subject_name: sub.name,
        question_count: questions.length,
        questions: questions.map(q => ({
          id: q.id,
          title: q.title,
          mastery_level: q.mastery_level,
          error_count: q.error_count
        }))
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
