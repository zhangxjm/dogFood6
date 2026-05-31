const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const TaxCalculator = require('../services/taxCalculator');
const customsApiClient = require('../services/customsApiClient');
const taskQueue = require('../services/taskQueue');

class DeclarationController {
  static async createDeclaration(req, res, next) {
    try {
      const {
        declaration_type,
        trade_mode,
        exporter_name,
        exporter_address,
        importer_name,
        importer_address,
        port_of_entry,
        port_of_departure,
        departure_date,
        arrival_date,
        transport_mode,
        voyage_no,
        bl_no,
        invoice_no,
        invoice_date,
        currency,
        items,
        created_by
      } = req.body;

      const declarationNo = `DEC${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const processedItems = items.map((item, index) => ({
        ...item,
        total_amount: item.quantity * item.unit_price,
        total_weight: item.quantity * (item.weight_per_unit || 0)
      }));

      const calculationResult = await TaxCalculator.calculateDeclarationItems(processedItems);
      const { totals } = calculationResult;

      const declarationId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO declarations (
            declaration_no, status, declaration_type, trade_mode,
            exporter_name, exporter_address, importer_name, importer_address,
            port_of_entry, port_of_departure, departure_date, arrival_date,
            transport_mode, voyage_no, bl_no, invoice_no, invoice_date,
            total_value, currency, total_weight, total_package_count,
            customs_duty, consumption_tax, vat_amount, total_tax, created_by
          ) VALUES (?, 'DRAFT', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            declarationNo, declaration_type || 'IMPORT', trade_mode || 'GENERAL_TRADE',
            exporter_name, exporter_address, importer_name, importer_address,
            port_of_entry, port_of_departure, departure_date, arrival_date,
            transport_mode || 'SEA', voyage_no, bl_no, invoice_no, invoice_date,
            totals.total_value, currency || 'USD', totals.total_weight, items.length,
            totals.customs_duty, totals.consumption_tax, totals.vat_amount, totals.total_tax, created_by || 'SYSTEM'
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      const insertItemPromises = calculationResult.items.map((item, index) => {
        return new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO declaration_items (
              declaration_id, product_id, item_no, product_name, hs_code, origin_country,
              quantity, unit, unit_price, total_amount, currency, weight_per_unit, total_weight,
              customs_duty_rate, consumption_tax_rate, vat_rate,
              customs_duty_amount, consumption_tax_amount, vat_amount, total_tax_amount,
              verification_status, verification_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              declarationId, item.product_id || null, item.item_no, item.product_name, item.hs_code, item.origin_country,
              item.quantity, item.unit || 'PCS', item.unit_price, item.total_amount, currency || 'USD',
              item.weight_per_unit || 0, item.total_weight || 0,
              item.customs_duty_rate, item.consumption_tax_rate, item.vat_rate,
              item.customs_duty_amount, item.consumption_tax_amount, item.vat_amount, item.total_tax_amount,
              item.verification_status, item.verification_message
            ],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });

      await Promise.all(insertItemPromises);

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO declaration_status_logs (declaration_id, status, message, operator) VALUES (?, 'DRAFT', '申报单已创建', ?)`,
          [declarationId, created_by || 'SYSTEM'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.status(201).json({
        success: true,
        data: {
          id: declarationId,
          declaration_no: declarationNo,
          status: 'DRAFT',
          ...totals
        },
        message: '申报单创建成功'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDeclarations(req, res, next) {
    try {
      const { page = 1, page_size = 10, status, keyword } = req.query;
      const offset = (page - 1) * page_size;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      
      if (keyword) {
        whereClause += ' AND (declaration_no LIKE ? OR exporter_name LIKE ? OR importer_name LIKE ?)';
        const searchKeyword = `%${keyword}%`;
        params.push(searchKeyword, searchKeyword, searchKeyword);
      }

      const countResult = await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as total FROM declarations ${whereClause}`, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      const declarations = await new Promise((resolve, reject) => {
        db.all(
          `SELECT id, declaration_no, status, declaration_type, trade_mode, exporter_name, importer_name, 
                  port_of_entry, total_value, currency, total_tax, submitted_at, released_at, created_at 
           FROM declarations ${whereClause} 
           ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [...params, parseInt(page_size), parseInt(offset)],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      res.json({
        success: true,
        data: declarations,
        pagination: {
          page: parseInt(page),
          page_size: parseInt(page_size),
          total: countResult.total,
          total_pages: Math.ceil(countResult.total / page_size)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDeclarationById(req, res, next) {
    try {
      const { id } = req.params;

      const declaration = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM declarations WHERE id = ?`, [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!declaration) {
        return res.status(404).json({
          success: false,
          error: {
            message: '申报单不存在'
          }
        });
      }

      const items = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM declaration_items WHERE declaration_id = ? ORDER BY item_no`, [id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const statusLogs = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM declaration_status_logs WHERE declaration_id = ? ORDER BY created_at`, [id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      res.json({
        success: true,
        data: {
          ...declaration,
          items,
          status_logs: statusLogs
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitDeclaration(req, res, next) {
    try {
      const { id } = req.params;
      const { submit_now = true } = req.body;

      const declaration = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM declarations WHERE id = ?`, [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!declaration) {
        return res.status(404).json({
          success: false,
          error: { message: '申报单不存在' }
        });
      }

      if (declaration.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          error: { message: '只有草稿状态的申报单可以提交' }
        });
      }

      const items = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM declaration_items WHERE declaration_id = ?`, [id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      if (submit_now) {
        const submitResult = await customsApiClient.submitDeclaration({
          ...declaration,
          items
        });

        if (submitResult.success) {
          await new Promise((resolve, reject) => {
            db.run(
              `UPDATE declarations SET status = 'SUBMITTED', submitted_at = ?, customs_response = ? WHERE id = ?`,
              [new Date().toISOString(), JSON.stringify(submitResult), id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          await new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO declaration_status_logs (declaration_id, status, message, operator) VALUES (?, 'SUBMITTED', ?, 'SYSTEM')`,
              [id, `申报单已提交至海关，海关受理号: ${submitResult.customsReferenceNo}`],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          await taskQueue.createTask('DECLARATION_AUTO_PROCESS', {
            declarationId: id,
            customsReferenceNo: submitResult.customsReferenceNo
          });

          res.json({
            success: true,
            data: {
              id,
              status: 'SUBMITTED',
              customs_reference_no: submitResult.customsReferenceNo,
              message: submitResult.message
            }
          });
        } else {
          res.status(400).json({
            success: false,
            error: {
              message: '海关申报提交失败',
              details: submitResult
            }
          });
        }
      } else {
        res.json({
          success: true,
          data: {
            id,
            status: 'READY_TO_SUBMIT',
            message: '申报单校验通过，可以提交'
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async calculateTaxes(req, res, next) {
    try {
      const { items } = req.body;
      
      const processedItems = items.map((item) => ({
        ...item,
        total_amount: item.quantity * item.unit_price,
        total_weight: item.quantity * (item.weight_per_unit || 0)
      }));

      const result = await TaxCalculator.calculateDeclarationItems(processedItems);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async batchSubmit(req, res, next) {
    try {
      const { declaration_ids } = req.body;

      const declarations = await new Promise((resolve, reject) => {
        const placeholders = declaration_ids.map(() => '?').join(',');
        db.all(
          `SELECT d.*, GROUP_CONCAT(...) FROM declarations d 
           LEFT JOIN declaration_items di ON d.id = di.declaration_id
           WHERE d.id IN (${placeholders}) AND d.status = 'DRAFT'
           GROUP BY d.id`,
          declaration_ids,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      const task = await taskQueue.createTask('BATCH_DECLARATION', {
        declarations
      });

      res.json({
        success: true,
        data: {
          task_id: task.taskId,
          message: '批量申报任务已创建，正在后台处理'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskStatus(req, res, next) {
    try {
      const { task_id } = req.params;
      
      const status = await taskQueue.getTaskStatus(task_id);
      
      if (!status) {
        return res.status(404).json({
          success: false,
          error: { message: '任务不存在' }
        });
      }

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyHsCode(req, res, next) {
    try {
      const { hs_code, product_name } = req.body;
      
      const result = await customsApiClient.verifyHsCode(hs_code, product_name);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStatistics(req, res, next) {
    try {
      const stats = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            status,
            COUNT(*) as count,
            SUM(total_value) as total_value,
            SUM(total_tax) as total_tax
          FROM declarations 
          GROUP BY status
          ORDER BY created_at DESC
        `, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const monthStats = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            strftime('%Y-%m', created_at) as month,
            COUNT(*) as count,
            SUM(total_value) as total_value,
            SUM(total_tax) as total_tax
          FROM declarations 
          WHERE created_at >= date('now', '-6 months')
          GROUP BY strftime('%Y-%m', created_at)
          ORDER BY month DESC
        `, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      res.json({
        success: true,
        data: {
          by_status: stats,
          last_6_months: monthStats
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DeclarationController;
