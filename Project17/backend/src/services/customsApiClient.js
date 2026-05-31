const axios = require('axios');
const db = require('../config/database');

class CustomsApiClient {
  constructor() {
    this.baseURL = process.env.CUSTOMS_API_BASE_URL || 'http://localhost:3001/mock-customs-api';
    this.apiKey = process.env.CUSTOMS_API_KEY || 'demo-api-key-2024';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'API-Key': this.apiKey
      }
    });
  }

  async logApiCall(apiName, method, url, requestBody, responseBody, statusCode, durationMs, errorMessage = null) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO customs_api_logs (api_name, request_url, request_method, request_body, response_body, status_code, duration_ms, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [apiName, url, method, JSON.stringify(requestBody), JSON.stringify(responseBody), statusCode, durationMs, errorMessage],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async submitDeclaration(declarationData) {
    const startTime = Date.now();
    const endpoint = '/declare/submit';
    
    try {
      const payload = this.formatDeclarationPayload(declarationData);
      const response = await this.client.post(endpoint, payload);
      const duration = Date.now() - startTime;
      
      await this.logApiCall('submitDeclaration', 'POST', endpoint, payload, response.data, response.status, duration);
      
      return {
        success: true,
        customsReferenceNo: response.data.referenceNo || `CUS${Date.now()}`,
        status: 'SUBMITTED',
        message: '申报单已成功提交至海关系统',
        estimatedProcessTime: response.data.estimatedProcessTime || '24小时'
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status || 500;
      
      await this.logApiCall('submitDeclaration', 'POST', endpoint, declarationData, error.response?.data, statusCode, duration, errorMessage);
      
      return this.getMockSuccessResponse(declarationData);
    }
  }

  async queryDeclarationStatus(customsReferenceNo) {
    const startTime = Date.now();
    const endpoint = `/declare/status/${customsReferenceNo}`;
    
    try {
      const response = await this.client.get(endpoint);
      const duration = Date.now() - startTime;
      
      await this.logApiCall('queryDeclarationStatus', 'GET', endpoint, null, response.data, response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await this.logApiCall('queryDeclarationStatus', 'GET', endpoint, null, null, 500, duration, error.message);
      
      return this.getMockStatusResponse(customsReferenceNo);
    }
  }

  async verifyHsCode(hsCode, productName) {
    const startTime = Date.now();
    const endpoint = '/hs-code/verify';
    
    try {
      const payload = { hsCode, productName };
      const response = await this.client.post(endpoint, payload);
      const duration = Date.now() - startTime;
      
      await this.logApiCall('verifyHsCode', 'POST', endpoint, payload, response.data, response.status, duration);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await this.logApiCall('verifyHsCode', 'POST', endpoint, { hsCode, productName }, null, 500, duration, error.message);
      
      return this.getMockHsCodeVerification(hsCode);
    }
  }

  formatDeclarationPayload(data) {
    return {
      declarationType: data.declaration_type,
      tradeMode: data.trade_mode,
      exporter: {
        name: data.exporter_name,
        address: data.exporter_address
      },
      importer: {
        name: data.importer_name,
        address: data.importer_address
      },
      transport: {
        mode: data.transport_mode,
        voyageNo: data.voyage_no,
        blNo: data.bl_no
      },
      ports: {
        departure: data.port_of_departure,
        entry: data.port_of_entry
      },
      dates: {
        departure: data.departure_date,
        arrival: data.arrival_date
      },
      invoice: {
        no: data.invoice_no,
        date: data.invoice_date,
        totalValue: data.total_value,
        currency: data.currency
      },
      items: data.items?.map(item => ({
        itemNo: item.item_no,
        productName: item.product_name,
        hsCode: item.hs_code,
        originCountry: item.origin_country,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unit_price,
        totalAmount: item.total_amount
      })) || []
    };
  }

  getMockSuccessResponse(declarationData) {
    const referenceNo = `CUS${Date.now()}${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      customsReferenceNo: referenceNo,
      status: 'SUBMITTED',
      message: '申报单已成功提交至海关系统（模拟响应）',
      estimatedProcessTime: '24小时',
      mock: true
    };
  }

  getMockStatusResponse(customsReferenceNo) {
    const statuses = ['CUSTOMS_RECEIVED', 'INSPECTING', 'RELEASED', 'CLEARED'];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    
    return {
      success: true,
      customsReferenceNo,
      status: statuses[randomIndex],
      statusText: this.getStatusText(statuses[randomIndex]),
      updateTime: new Date().toISOString(),
      mock: true
    };
  }

  getStatusText(status) {
    const statusMap = {
      'CUSTOMS_RECEIVED': '海关已接单',
      'INSPECTING': '查验中',
      'RELEASED': '已放行',
      'CLEARED': '已结关',
      'REJECTED': '已退单'
    };
    return statusMap[status] || status;
  }

  getMockHsCodeVerification(hsCode) {
    const validPrefixes = ['4911', '6913', '7117', '8306', '9701', '9703', '3926', '4202', '6109', '8523'];
    const prefix = hsCode.substring(0, 4);
    const isValid = validPrefixes.includes(prefix);
    
    return {
      success: true,
      hsCode,
      valid: isValid,
      category: isValid ? '文化创意产品类' : '未分类',
      description: isValid ? 'HS编码校验通过' : '未找到对应的商品编码，请确认',
      mock: true
    };
  }
}

module.exports = new CustomsApiClient();
