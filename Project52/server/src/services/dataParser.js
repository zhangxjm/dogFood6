function parseCSV(rawData, config = {}) {
  const delimiter = config.delimiter || ',';
  const skipRows = config.skip_rows || 0;
  const encoding = config.encoding || 'utf-8';
  const decimalSep = config.decimal_separator || '.';

  const lines = rawData.split(/\r?\n/).filter(l => l.trim());
  const dataLines = lines.slice(skipRows);

  if (dataLines.length === 0) return { headers: [], rows: [], totalRows: 0 };

  const headers = dataLines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < dataLines.length; i++) {
    const values = dataLines[i].split(delimiter).map(v => {
      let val = v.trim().replace(/^"|"$/g, '');
      if (decimalSep !== '.' && val.includes(decimalSep)) {
        val = val.replace(decimalSep, '.');
      }
      const num = Number(val);
      return isNaN(num) ? val : num;
    });
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx]; });
      rows.push(row);
    }
  }

  return { headers, rows, totalRows: rows.length };
}

function parseJSON(rawData, config = {}) {
  const rootKey = config.root_key || null;
  const timestampKey = config.timestamp_key || 'timestamp';
  const valuesKey = config.values_key || 'values';
  const encoding = config.encoding || 'utf-8';

  let data;
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    throw new Error('JSON解析失败: ' + e.message);
  }

  if (rootKey && data[rootKey]) {
    data = data[rootKey];
  }

  if (Array.isArray(data)) {
    return { headers: Object.keys(data[0] || {}), rows: data, totalRows: data.length };
  }

  if (data[valuesKey] && Array.isArray(data[valuesKey])) {
    const rows = data[valuesKey];
    return { headers: Object.keys(rows[0] || {}), rows, totalRows: rows.length };
  }

  if (typeof data === 'object') {
    const rows = [];
    const entries = Object.entries(data);
    for (const [key, value] of entries) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        rows.push({ key, ...value });
      } else {
        rows.push({ key, value });
      }
    }
    return { headers: ['key', ...Object.keys(rows[0] || {}).filter(k => k !== 'key')], rows, totalRows: rows.length };
  }

  return { headers: [], rows: [], totalRows: 0 };
}

function parseXML(rawData, config = {}) {
  const rootTag = config.root_tag || 'Root';
  const recordTag = config.record_tag || 'Record';
  const encoding = config.encoding || 'utf-8';

  const rows = [];
  const recordRegex = new RegExp(`<${recordTag}[^>]*>([\\s\\S]*?)<\\/${recordTag}>`, 'g');
  let match;

  while ((match = recordRegex.exec(rawData)) !== null) {
    const recordContent = match[1];
    const row = {};
    const fieldRegex = /<(\w+)[^>]*>([\\s\\S]*?)<\/\1>/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(recordContent)) !== null) {
      const key = fieldMatch[1];
      const val = fieldMatch[2].trim();
      const num = Number(val);
      row[key] = isNaN(num) || val === '' ? val : num;
    }
    rows.push(row);
  }

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows, totalRows: rows.length };
}

function parseBinary(rawData, config = {}) {
  const byteOrder = config.byte_order || 'little-endian';
  const headerSize = config.header_size || 0;
  const recordSize = config.record_size || 32;
  const encoding = config.encoding || 'hex';

  let buffer;
  if (Buffer.isBuffer(rawData)) {
    buffer = rawData;
  } else if (typeof rawData === 'string') {
    if (encoding === 'hex') {
      const hexStr = rawData.replace(/[^0-9a-fA-F]/g, '');
      buffer = Buffer.from(hexStr, 'hex');
    } else {
      buffer = Buffer.from(rawData, encoding);
    }
  } else {
    throw new Error('不支持的二进制数据格式');
  }

  if (buffer.length < headerSize) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const isLE = byteOrder === 'little-endian';
  const dataBuffer = buffer.slice(headerSize);
  const numRecords = Math.floor(dataBuffer.length / recordSize);
  const headers = ['record_index', 'raw_hex', 'timestamp', 'value', 'status'];
  const rows = [];

  for (let i = 0; i < numRecords; i++) {
    const offset = i * recordSize;
    const record = dataBuffer.slice(offset, offset + recordSize);
    const row = {
      record_index: i,
      raw_hex: record.toString('hex').substring(0, 64),
      timestamp: record.length >= 8 ? Number(record.readBigInt64LE ? record.readBigInt64LE(0) : 0) : 0,
      value: record.length >= 18 ? record.readDoubleLE(8) : 0,
      status: record.length >= 20 ? record.readUInt16LE(18) : 0
    };
    rows.push(row);
  }

  return { headers, rows, totalRows: rows.length };
}

function parseTXT(rawData, config = {}) {
  const delimiter = config.delimiter || '\t';
  const skipRows = config.skip_rows || 0;
  const commentChar = config.comment_char || '#';
  const encoding = config.encoding || 'utf-8';

  const lines = rawData.split(/\r?\n/)
    .filter(l => l.trim() && !l.trim().startsWith(commentChar));
  const dataLines = lines.slice(skipRows);

  if (dataLines.length === 0) return { headers: [], rows: [], totalRows: 0 };

  const headers = dataLines[0].split(delimiter).map(h => h.trim());
  const rows = [];

  for (let i = 1; i < dataLines.length; i++) {
    const values = dataLines[i].split(delimiter).map(v => {
      const val = v.trim();
      const num = Number(val);
      return isNaN(num) || val === '' ? val : num;
    });
    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx]; });
      rows.push(row);
    }
  }

  return { headers, rows, totalRows: rows.length };
}

function standardizeData(parsedData, targetFormat = 'json') {
  if (!parsedData || !parsedData.rows) {
    return { format: targetFormat, data: null, metadata: { standardized: true } };
  }

  const metadata = {
    totalRows: parsedData.totalRows,
    headers: parsedData.headers,
    standardized: true
  };

  if (targetFormat === 'json') {
    return { format: 'json', data: parsedData.rows, metadata };
  }

  if (targetFormat === 'csv') {
    const headerLine = parsedData.headers.join(',');
    const dataLines = parsedData.rows.map(row =>
      parsedData.headers.map(h => {
        const val = row[h];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')
    );
    return { format: 'csv', data: [headerLine, ...dataLines].join('\n'), metadata };
  }

  if (targetFormat === 'xml') {
    const xmlRows = parsedData.rows.map(row => {
      const fields = parsedData.headers.map(h => `    <${h}>${row[h] !== undefined ? row[h] : ''}</${h}>`).join('\n');
      return `  <Record>\n${fields}\n  </Record>`;
    });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<StandardData>\n${xmlRows.join('\n')}\n</StandardData>`;
    return { format: 'xml', data: xml, metadata };
  }

  return { format: targetFormat, data: parsedData.rows, metadata };
}

module.exports = {
  parseCSV,
  parseJSON,
  parseXML,
  parseBinary,
  parseTXT,
  standardizeData
};
