const { Sequelize, DataTypes, Model } = require('sequelize');
const os = require('os');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root123456';
const DB_NAME = process.env.DB_NAME || 'error_notebook';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false
});

class Subject extends Model {}
Subject.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'Subject',
  tableName: 'subjects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

class KnowledgePoint extends Model {}
KnowledgePoint.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Subject,
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'KnowledgePoint',
  tableName: 'knowledge_points',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

class Category extends Model {}
Category.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

class Question extends Model {}
Question.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Subject,
      key: 'id'
    }
  },
  knowledge_point_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: KnowledgePoint,
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  analysis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  error_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  last_practice_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  next_practice_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  mastery_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Question',
  tableName: 'questions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

class PracticeRecord extends Model {}
PracticeRecord.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Question,
      key: 'id'
    }
  },
  is_correct: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_answer: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'PracticeRecord',
  tableName: 'practice_records',
  timestamps: true,
  createdAt: 'practiced_at',
  updatedAt: false
});

Subject.hasMany(Question, { foreignKey: 'subject_id' });
Question.belongsTo(Subject, { foreignKey: 'subject_id' });

KnowledgePoint.hasMany(Question, { foreignKey: 'knowledge_point_id' });
Question.belongsTo(KnowledgePoint, { foreignKey: 'knowledge_point_id' });

Category.hasMany(Question, { foreignKey: 'category_id' });
Question.belongsTo(Category, { foreignKey: 'category_id' });

Question.hasMany(PracticeRecord, { foreignKey: 'question_id' });
PracticeRecord.belongsTo(Question, { foreignKey: 'question_id' });

Subject.hasMany(KnowledgePoint, { foreignKey: 'subject_id' });
KnowledgePoint.belongsTo(Subject, { foreignKey: 'subject_id' });

async function initDB() {
  await sequelize.sync({ force: false });
  console.log('Database tables created successfully!');
}

module.exports = {
  sequelize,
  Subject,
  KnowledgePoint,
  Category,
  Question,
  PracticeRecord,
  initDB
};
