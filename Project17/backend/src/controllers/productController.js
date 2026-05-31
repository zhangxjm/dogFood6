const db = require('../config/database');

class ProductController {
  static async getCategories(req, res, next) {
    try {
      const categories = await new Promise((resolve, reject) => {
        db.all(
          `SELECT id, hs_code, category_name, description, tax_rate, consumption_tax_rate, vat_rate, is_restricted, required_documents 
           FROM product_categories 
           ORDER BY category_name`,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryByHsCode(req, res, next) {
    try {
      const { hs_code } = req.params;

      const category = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM product_categories WHERE hs_code = ?`,
          [hs_code],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: { message: '未找到对应的商品分类' }
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req, res, next) {
    try {
      const { page = 1, page_size = 20, keyword, category_id, hs_code } = req.query;
      const offset = (page - 1) * page_size;

      let whereClause = 'WHERE p.is_active = 1';
      const params = [];

      if (keyword) {
        whereClause += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
        const searchKeyword = `%${keyword}%`;
        params.push(searchKeyword, searchKeyword, searchKeyword);
      }

      if (category_id) {
        whereClause += ' AND p.category_id = ?';
        params.push(category_id);
      }

      if (hs_code) {
        whereClause += ' AND p.hs_code LIKE ?';
        params.push(`${hs_code}%`);
      }

      const countResult = await new Promise((resolve, reject) => {
        db.get(
          `SELECT COUNT(*) as total FROM products p ${whereClause}`,
          params,
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      const products = await new Promise((resolve, reject) => {
        db.all(
          `SELECT p.*, pc.category_name, pc.tax_rate, pc.consumption_tax_rate, pc.vat_rate 
           FROM products p 
           LEFT JOIN product_categories pc ON p.hs_code = pc.hs_code 
           ${whereClause} 
           ORDER BY p.created_at DESC 
           LIMIT ? OFFSET ?`,
          [...params, parseInt(page_size), parseInt(offset)],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      res.json({
        success: true,
        data: products,
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

  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      const product = await new Promise((resolve, reject) => {
        db.get(
          `SELECT p.*, pc.category_name, pc.tax_rate, pc.consumption_tax_rate, pc.vat_rate, pc.is_restricted, pc.required_documents
           FROM products p 
           LEFT JOIN product_categories pc ON p.hs_code = pc.hs_code 
           WHERE p.id = ?`,
          [id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: { message: '商品不存在' }
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req, res, next) {
    try {
      const {
        sku,
        name,
        description,
        hs_code,
        origin_country,
        unit_price,
        currency,
        weight,
        dimensions,
        image_url
      } = req.body;

      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO products (sku, name, description, hs_code, origin_country, unit_price, currency, weight, dimensions, image_url) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [sku, name, description, hs_code, origin_country, unit_price, currency || 'USD', weight, dimensions, image_url],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      res.status(201).json({
        success: true,
        data: {
          id: result,
          sku,
          name
        },
        message: '商品创建成功'
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        hs_code,
        origin_country,
        unit_price,
        currency,
        weight,
        dimensions,
        image_url,
        is_active
      } = req.body;

      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
      }
      if (hs_code !== undefined) {
        updates.push('hs_code = ?');
        params.push(hs_code);
      }
      if (origin_country !== undefined) {
        updates.push('origin_country = ?');
        params.push(origin_country);
      }
      if (unit_price !== undefined) {
        updates.push('unit_price = ?');
        params.push(unit_price);
      }
      if (currency !== undefined) {
        updates.push('currency = ?');
        params.push(currency);
      }
      if (weight !== undefined) {
        updates.push('weight = ?');
        params.push(weight);
      }
      if (dimensions !== undefined) {
        updates.push('dimensions = ?');
        params.push(dimensions);
      }
      if (image_url !== undefined) {
        updates.push('image_url = ?');
        params.push(image_url);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        params.push(is_active);
      }

      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
          params,
          function(err) {
            if (err) reject(err);
            else if (this.changes === 0) reject(new Error('Product not found'));
            else resolve();
          }
        );
      });

      res.json({
        success: true,
        message: '商品更新成功'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE products SET is_active = 0, updated_at = ? WHERE id = ?`,
          [new Date().toISOString(), id],
          function(err) {
            if (err) reject(err);
            else if (this.changes === 0) reject(new Error('Product not found'));
            else resolve();
          }
        );
      });

      res.json({
        success: true,
        message: '商品已删除'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
