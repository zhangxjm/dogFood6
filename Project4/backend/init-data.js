const { db } = require('./database');

function initData() {
  try {
    const subjectCount = db.count('subjects');
    if (subjectCount === 0) {
      const subjects = [
        { name: '数学' },
        { name: '语文' },
        { name: '英语' },
        { name: '物理' },
        { name: '化学' },
        { name: '生物' }
      ];
      const createdSubjects = subjects.map(s => db.create('subjects', s));
      console.log('Subjects initialized!');

      const mathSubject = createdSubjects.find(s => s.name === '数学');
      const chineseSubject = createdSubjects.find(s => s.name === '语文');
      const englishSubject = createdSubjects.find(s => s.name === '英语');
      const physicsSubject = createdSubjects.find(s => s.name === '物理');
      const chemistrySubject = createdSubjects.find(s => s.name === '化学');

      const kpCount = db.count('knowledge_points');
      if (kpCount === 0) {
        const knowledgePoints = [
          { name: '函数与导数', subject_id: mathSubject.id },
          { name: '三角函数', subject_id: mathSubject.id },
          { name: '数列', subject_id: mathSubject.id },
          { name: '立体几何', subject_id: mathSubject.id },
          { name: '解析几何', subject_id: mathSubject.id },
          { name: '概率统计', subject_id: mathSubject.id },
          { name: '文言文阅读', subject_id: chineseSubject.id },
          { name: '现代文阅读', subject_id: chineseSubject.id },
          { name: '作文', subject_id: chineseSubject.id },
          { name: '语法填空', subject_id: englishSubject.id },
          { name: '阅读理解', subject_id: englishSubject.id },
          { name: '完形填空', subject_id: englishSubject.id },
          { name: '力学', subject_id: physicsSubject.id },
          { name: '电磁学', subject_id: physicsSubject.id },
          { name: '有机化学', subject_id: chemistrySubject.id },
          { name: '无机化学', subject_id: chemistrySubject.id }
        ];
        knowledgePoints.forEach(kp => db.create('knowledge_points', kp));
        console.log('Knowledge points initialized!');
      }
    }

    const categoryCount = db.count('categories');
    if (categoryCount === 0) {
      const categories = [
        { name: '概念理解', description: '基础概念理解错误' },
        { name: '计算错误', description: '计算过程出现错误' },
        { name: '审题错误', description: '未正确理解题目要求' },
        { name: '方法错误', description: '解题方法选择不当' },
        { name: '知识遗忘', description: '知识点记忆不牢固' },
        { name: '粗心大意', description: '因粗心导致的错误' }
      ];
      categories.forEach(c => db.create('categories', c));
      console.log('Categories initialized!');
    }

    const questionCount = db.count('questions');
    if (questionCount === 0) {
      const mathSubject = db.getAll('subjects').find(s => s.name === '数学');
      const chineseSubject = db.getAll('subjects').find(s => s.name === '语文');
      const englishSubject = db.getAll('subjects').find(s => s.name === '英语');
      const physicsSubject = db.getAll('subjects').find(s => s.name === '物理');

      const funcKp = db.getAll('knowledge_points').find(kp => kp.name === '函数与导数');
      const trigKp = db.getAll('knowledge_points').find(kp => kp.name === '三角函数');
      const readingKp = db.getAll('knowledge_points').find(kp => kp.name === '现代文阅读');
      const grammarKp = db.getAll('knowledge_points').find(kp => kp.name === '语法填空');
      const mechanicsKp = db.getAll('knowledge_points').find(kp => kp.name === '力学');

      const conceptCat = db.getAll('categories').find(c => c.name === '概念理解');
      const calcCat = db.getAll('categories').find(c => c.name === '计算错误');
      const methodCat = db.getAll('categories').find(c => c.name === '方法错误');
      const carelessCat = db.getAll('categories').find(c => c.name === '粗心大意');

      const now = new Date();
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const questions = [
        {
          subject_id: mathSubject.id,
          knowledge_point_id: funcKp.id,
          category_id: conceptCat.id,
          title: '已知函数f(x)=x³-3x+1，求f(x)的极值点',
          content: '已知函数f(x)=x³-3x+1，求f(x)的极值点。',
          answer: "f'(x)=3x²-3=3(x+1)(x-1)，令f'(x)=0，得x=±1。当x<-1时，f'(x)>0；当-1<x<1时，f'(x)<0；当x>1时，f'(x)>0。所以x=-1是极大值点，x=1是极小值点。",
          analysis: '本题考查利用导数求函数极值点的方法。需要先求导，再令导数为0，最后判断导数在各区间的符号变化来确定极值点类型。',
          mastery_level: 0,
          error_count: 1,
          next_practice_at: now.toISOString()
        },
        {
          subject_id: mathSubject.id,
          knowledge_point_id: trigKp.id,
          category_id: calcCat.id,
          title: '在△ABC中，a=7，b=5，c=3，求最大角',
          content: '在△ABC中，已知a=7，b=5，c=3，求最大角的度数。',
          answer: '由余弦定理：cosA=(b²+c²-a²)/(2bc)=(25+9-49)/(2×5×3)=(-15)/30=-1/2，所以A=120°。',
          analysis: '本题考查余弦定理的应用。大边对大角，所以a边对的角A最大。使用余弦定理计算cosA，再根据特殊角的三角函数值求出角度。',
          mastery_level: 1,
          error_count: 2,
          next_practice_at: in3Days.toISOString()
        },
        {
          subject_id: chineseSubject.id,
          knowledge_point_id: readingKp.id,
          category_id: methodCat.id,
          title: '分析文中画线句子的表达效果',
          content: '阅读下面的文字，分析画线句子的表达效果。\n\n那是一个阳光明媚的下午，树叶在风中轻轻摇曳，仿佛在诉说着什么。',
          answer: '运用拟人的修辞手法，将树叶赋予人的动作"诉说"，生动形象地写出了树叶在风中摇摆的情态，烘托出宁静而略带忧伤的氛围。',
          analysis: '本题考查现代文阅读中句子赏析的能力。需要从修辞手法、描写手法等角度分析句子的表达效果。',
          mastery_level: 0,
          error_count: 1,
          next_practice_at: now.toISOString()
        },
        {
          subject_id: englishSubject.id,
          knowledge_point_id: grammarKp.id,
          category_id: conceptCat.id,
          title: 'The book _____ on the desk is mine.',
          content: 'Fill in the blank with the correct form of the verb.\nThe book _____ on the desk is mine.\nA. lying  B. laying  C. lain  D. laid',
          answer: 'A. lying\n\nlie表示"躺、位于"，其现在分词形式为lying。lay表示"放置"，过去式为laid。此处表示"位于桌上的书"，应用lying作定语。',
          analysis: '本题考查动词lie和lay的用法区别。lie是不及物动词，表示"躺、位于"；lay是及物动词，表示"放置"。需要根据语境判断使用哪个词。',
          mastery_level: 2,
          error_count: 3,
          next_practice_at: in7Days.toISOString()
        },
        {
          subject_id: physicsSubject.id,
          knowledge_point_id: mechanicsKp.id,
          category_id: carelessCat.id,
          title: '一物体从高处自由下落，求落地时的速度',
          content: '一物体从20m高处自由下落（g=10m/s²），求物体落地时的速度大小。',
          answer: '由v²=2gh得：v=√(2gh)=√(2×10×20)=√400=20m/s。',
          analysis: '本题考查自由落体运动的速度计算。使用公式v²=2gh，注意单位要统一。',
          mastery_level: 1,
          error_count: 2,
          next_practice_at: in3Days.toISOString()
        },
        {
          subject_id: mathSubject.id,
          knowledge_point_id: funcKp.id,
          category_id: methodCat.id,
          title: '设函数f(x)=e^x-ax，讨论f(x)的单调性',
          content: '设函数f(x)=e^x-ax（a>0），讨论f(x)的单调性。',
          answer: "f'(x)=e^x-a，令f'(x)=0，得x=lna。\n当x<lna时，f'(x)<0，f(x)单调递减；\n当x>lna时，f'(x)>0，f(x)单调递增。\n所以f(x)在(-∞,lna)上单调递减，在(lna,+∞)上单调递增。",
          analysis: '本题考查利用导数讨论函数单调性。需要求导后分析导数的符号变化，注意a>0的条件。',
          mastery_level: 0,
          error_count: 1,
          next_practice_at: now.toISOString()
        }
      ];
      questions.forEach(q => db.create('questions', q));
      console.log('Sample questions initialized!');
    }

    console.log('Data initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing data:', error);
    return false;
  }
}

module.exports = { initData };

if (require.main === module) {
  const success = initData();
  if (success) {
    console.log('System initialization completed!');
    process.exit(0);
  } else {
    console.log('System initialization failed!');
    process.exit(1);
  }
}
