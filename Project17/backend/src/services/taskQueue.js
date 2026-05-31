const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const customsApiClient = require('./customsApiClient');

class TaskQueue {
  constructor() {
    this.tasks = new Map();
    this.processing = false;
    this.startWorker();
  }

  async createTask(taskType, payload) {
    const taskId = uuidv4();
    
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO async_tasks (task_id, task_type, status, payload) VALUES (?, ?, 'PENDING', ?)`,
        [taskId, taskType, JSON.stringify(payload)],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const task = {
      id: taskId,
      type: taskType,
      status: 'PENDING',
      payload,
      progress: 0,
      createdAt: new Date()
    };
    
    this.tasks.set(taskId, task);
    this.processQueue();
    
    return { taskId, status: 'PENDING' };
  }

  async getTaskStatus(taskId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT task_id, task_type, status, progress, result, error_message, started_at, completed_at, created_at FROM async_tasks WHERE task_id = ?`,
        [taskId],
        (err, row) => {
          if (err) reject(err);
          else if (!row) resolve(null);
          else resolve({
            taskId: row.task_id,
            taskType: row.task_type,
            status: row.status,
            progress: row.progress,
            result: row.result ? JSON.parse(row.result) : null,
            errorMessage: row.error_message,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            createdAt: row.created_at
          });
        }
      );
    });
  }

  async updateTaskStatus(taskId, status, progress = null, result = null, errorMessage = null) {
    const updates = [];
    const params = [];
    
    updates.push('status = ?');
    params.push(status);
    
    if (progress !== null) {
      updates.push('progress = ?');
      params.push(progress);
    }
    
    if (result !== null) {
      updates.push('result = ?');
      params.push(JSON.stringify(result));
    }
    
    if (errorMessage !== null) {
      updates.push('error_message = ?');
      params.push(errorMessage);
    }
    
    if (status === 'PROCESSING') {
      updates.push('started_at = ?');
      params.push(new Date().toISOString());
    }
    
    if (status === 'COMPLETED' || status === 'FAILED') {
      updates.push('completed_at = ?');
      params.push(new Date().toISOString());
    }
    
    params.push(taskId);
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE async_tasks SET ${updates.join(', ')} WHERE task_id = ?`,
        params,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async processQueue() {
    if (this.processing) return;
    
    this.processing = true;
    
    while (true) {
      try {
        const pendingTask = await this.getNextPendingTask();
        
        if (!pendingTask) {
          this.processing = false;
          break;
        }
        
        try {
          await this.processTask(pendingTask);
        } catch (error) {
          console.error(`Task ${pendingTask.task_id} failed:`, error);
          await this.updateTaskStatus(pendingTask.task_id, 'FAILED', null, null, error.message);
        }
      } catch (error) {
        console.error('Error processing task queue:', error.message);
        this.processing = false;
        break;
      }
    }
  }

  async getNextPendingTask() {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT task_id, task_type, payload FROM async_tasks WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 1`,
        (err, row) => {
          if (err) {
            if (err.code === 'SQLITE_ERROR' && err.message.includes('no such table')) {
              resolve(null);
            } else {
              reject(err);
            }
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  async processTask(task) {
    const payload = JSON.parse(task.payload);
    
    await this.updateTaskStatus(task.task_id, 'PROCESSING', 10);
    
    switch (task.task_type) {
      case 'BATCH_DECLARATION':
        await this.processBatchDeclaration(task.task_id, payload);
        break;
      case 'BATCH_STATUS_QUERY':
        await this.processBatchStatusQuery(task.task_id, payload);
        break;
      case 'HS_CODE_BATCH_VERIFY':
        await this.processHsCodeBatchVerify(task.task_id, payload);
        break;
      case 'DECLARATION_AUTO_PROCESS':
        await this.processDeclarationAutoProcess(task.task_id, payload);
        break;
      default:
        throw new Error(`Unknown task type: ${task.task_type}`);
    }
  }

  async processBatchDeclaration(taskId, payload) {
    const { declarations } = payload;
    const results = [];
    
    for (let i = 0; i < declarations.length; i++) {
      const progress = Math.round(10 + ((i + 1) / declarations.length) * 80);
      await this.updateTaskStatus(taskId, 'PROCESSING', progress);
      
      const declaration = declarations[i];
      try {
        const result = await customsApiClient.submitDeclaration(declaration);
        results.push({
          index: i,
          success: true,
          customsReferenceNo: result.customsReferenceNo,
          declarationNo: declaration.declaration_no
        });
      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: error.message,
          declarationNo: declaration.declaration_no
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    await this.updateTaskStatus(taskId, 'COMPLETED', 100, { results });
  }

  async processBatchStatusQuery(taskId, payload) {
    const { referenceNos } = payload;
    const results = [];
    
    for (let i = 0; i < referenceNos.length; i++) {
      const progress = Math.round(10 + ((i + 1) / referenceNos.length) * 80);
      await this.updateTaskStatus(taskId, 'PROCESSING', progress);
      
      try {
        const status = await customsApiClient.queryDeclarationStatus(referenceNos[i]);
        results.push({
          referenceNo: referenceNos[i],
          ...status
        });
      } catch (error) {
        results.push({
          referenceNo: referenceNos[i],
          success: false,
          error: error.message
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    await this.updateTaskStatus(taskId, 'COMPLETED', 100, { results });
  }

  async processHsCodeBatchVerify(taskId, payload) {
    const { items } = payload;
    const results = [];
    
    for (let i = 0; i < items.length; i++) {
      const progress = Math.round(10 + ((i + 1) / items.length) * 80);
      await this.updateTaskStatus(taskId, 'PROCESSING', progress);
      
      const item = items[i];
      try {
        const verification = await customsApiClient.verifyHsCode(item.hs_code, item.product_name);
        results.push({
          ...item,
          ...verification
        });
      } catch (error) {
        results.push({
          ...item,
          success: false,
          error: error.message
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    await this.updateTaskStatus(taskId, 'COMPLETED', 100, { results });
  }

  async processDeclarationAutoProcess(taskId, payload) {
    const { declarationId, customsReferenceNo } = payload;
    
    const statusFlow = [
      { status: 'SUBMITTED', message: '已提交申报' },
      { status: 'CUSTOMS_RECEIVED', message: '海关已接收' },
      { status: 'INSPECTING', message: '海关查验中' },
      { status: 'RELEASED', message: '海关已放行' },
      { status: 'CLEARED', message: '已结关' }
    ];
    
    for (let i = 0; i < statusFlow.length; i++) {
      const progress = Math.round(10 + ((i + 1) / statusFlow.length) * 80);
      await this.updateTaskStatus(taskId, 'PROCESSING', progress);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.updateDeclarationStatus(declarationId, statusFlow[i].status);
    }
    
    await this.updateTaskStatus(taskId, 'COMPLETED', 100, { 
      declarationId, 
      customsReferenceNo,
      finalStatus: 'CLEARED' 
    });
  }

  async updateDeclarationStatus(declarationId, status) {
    const now = new Date().toISOString();
    const updates = [];
    const params = [];
    
    updates.push('status = ?');
    params.push(status);
    
    switch (status) {
      case 'SUBMITTED':
        updates.push('submitted_at = ?');
        params.push(now);
        break;
      case 'CUSTOMS_RECEIVED':
        updates.push('customs_received_at = ?');
        params.push(now);
        break;
      case 'INSPECTING':
        updates.push('inspected_at = ?');
        params.push(now);
        break;
      case 'RELEASED':
        updates.push('released_at = ?');
        params.push(now);
        break;
      case 'CLEARED':
        updates.push('released_at = ?');
        params.push(now);
        break;
    }
    
    params.push(declarationId);
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE declarations SET ${updates.join(', ')} WHERE id = ?`,
        params,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO declaration_status_logs (declaration_id, status, message, operator) VALUES (?, ?, ?, 'SYSTEM')`,
        [declarationId, status, this.getStatusMessage(status)],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  getStatusMessage(status) {
    const messages = {
      'DRAFT': '申报单已创建',
      'SUBMITTED': '申报单已提交至海关',
      'CUSTOMS_RECEIVED': '海关系统已接收申报',
      'INSPECTING': '海关正在进行查验',
      'RELEASED': '货物已放行',
      'CLEARED': '已完成清关',
      'REJECTED': '申报被退回'
    };
    return messages[status] || `状态更新为: ${status}`;
  }

  startWorker() {
    setInterval(() => {
      if (!this.processing) {
        this.processQueue();
      }
    }, 5000);
    
    console.log('Task queue worker started');
  }
}

module.exports = new TaskQueue();
