const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const { getAsync, runAsync, allAsync } = require('../db/init');

const REPORTS_DIR = path.join(__dirname, '..', '..', 'reports');

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

async function generateReport(experimentId, templateId) {
  const experiment = await getAsync('SELECT * FROM experiments WHERE id = ?', [experimentId]);
  if (!experiment) {
    throw new Error('Experiment not found');
  }

  const template = templateId
    ? await getAsync('SELECT * FROM report_templates WHERE id = ?', [templateId])
    : await getAsync('SELECT * FROM report_templates WHERE is_active = 1 LIMIT 1');

  const experimentData = await allAsync('SELECT * FROM experiment_data WHERE experiment_id = ?', [experimentId]);
  const device = experiment.device_id ? await getAsync('SELECT * FROM devices WHERE id = ?', [experiment.device_id]) : null;

  ensureReportsDir();

  const reportId = uuidv4();
  const fileName = `report_${experimentId}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const fontPath = findChineseFont();
  if (fontPath) {
    doc.registerFont('Chinese', fontPath);
    doc.font('Chinese');
  }

  doc.fontSize(22).text('Aerospace Payload Test Data System', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(18).text('Test Report', { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(10).text(`Report ID: ${reportId}`, { align: 'right' });
  doc.text(`Generated: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, { align: 'right' });
  doc.moveDown(1);

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  const sections = template ? JSON.parse(template.sections) : ['Overview', 'Conditions', 'Equipment', 'Data', 'Analysis', 'Conclusion'];

  doc.fontSize(14).text('1. Experiment Overview');
  doc.moveDown(0.3);
  doc.fontSize(10);
  doc.text(`Experiment Name: ${experiment.name}`);
  doc.text(`Experiment Type: ${experiment.type}`);
  doc.text(`Experiment Status: ${experiment.status}`);
  doc.text(`Responsible Person: ${experiment.responsible_person || 'Not specified'}`);
  doc.text(`Start Time: ${experiment.start_time || 'Not started'}`);
  doc.text(`End Time: ${experiment.end_time || 'Not finished'}`);
  doc.moveDown(0.5);
  if (experiment.description) {
    doc.text(`Description: ${experiment.description}`);
  }
  doc.moveDown(1);

  if (sections.includes('Conditions') && experiment.parameters) {
    doc.fontSize(14).text('2. Test Conditions');
    doc.moveDown(0.3);
    doc.fontSize(10);
    try {
      const params = JSON.parse(experiment.parameters);
      for (const [key, value] of Object.entries(params)) {
        const valStr = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
        doc.text(`  ${key}: ${valStr}`);
      }
    } catch {
      doc.text(`  ${experiment.parameters}`);
    }
    doc.moveDown(1);
  }

  if (device) {
    doc.fontSize(14).text('3. Test Equipment');
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(`Equipment Name: ${device.name}`);
    doc.text(`Model: ${device.model || 'Unknown'}`);
    doc.text(`Location: ${device.location || 'Unknown'}`);
    if (device.last_calibration_date) {
      doc.text(`Last Calibration: ${device.last_calibration_date}`);
    }
    doc.moveDown(1);
  }

  if (experimentData.length > 0) {
    doc.fontSize(14).text('4. Experiment Data');
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(`Data Files: ${experimentData.length}`);
    doc.text(`Total Data Points: ${experimentData.reduce((sum, d) => sum + (d.data_points || 0), 0).toLocaleString()}`);
    doc.moveDown(0.3);

    for (const d of experimentData.slice(0, 10)) {
      doc.text(`  - ${d.file_name} (${(d.file_size / 1024).toFixed(1)}KB, ${d.data_points.toLocaleString()} points)`);
    }
    if (experimentData.length > 10) {
      doc.text(`  ... and ${experimentData.length - 10} more files`);
    }
    doc.moveDown(1);
  }

  doc.fontSize(14).text('5. Data Charts');
  doc.moveDown(0.3);
  doc.fontSize(10).text('[Chart area - to be generated with specialized tools]');
  doc.moveDown(0.5);
  const chartY = doc.y;
  doc.rect(50, chartY, 495, 120).stroke('#cccccc');
  doc.fontSize(9).fillColor('#999999').text('Data visualization chart placeholder', 50, chartY + 50, { width: 495, align: 'center' });
  doc.fillColor('#000000');
  doc.y = chartY + 140;
  doc.moveDown(1);

  doc.fontSize(14).text('6. Conclusions and Recommendations');
  doc.moveDown(0.3);
  doc.fontSize(10);
  if (experiment.status === 'completed') {
    doc.text('The experiment has been completed. Data collection and analysis results meet expected requirements.');
  } else if (experiment.status === 'abnormal') {
    doc.text('Anomaly occurred during the experiment. Further investigation is needed to re-evaluate the test plan.');
  } else {
    doc.text('Experiment in progress. Conclusions will be updated after completion.');
  }
  doc.moveDown(1);

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(9).text('This report is automatically generated by the Aerospace Payload Test Data Management System', { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', async () => {
      await runAsync(
        'INSERT INTO reports (id, experiment_id, template_id, title, status, file_path, generated_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [reportId, experimentId, templateId || null, `${experiment.name} - Test Report`, 'generated', filePath, 'System']
      );

      resolve({ reportId, filePath, fileName });
    });
    stream.on('error', reject);
  });
}

function findChineseFont() {
  const candidates = [
    'C:\\Windows\\Fonts\\msyh.ttc',
    'C:\\Windows\\Fonts\\msyhbd.ttc',
    'C:\\Windows\\Fonts\\simhei.ttf',
    'C:\\Windows\\Fonts\\simsun.ttc',
    '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/System/Library/Fonts/PingFang.ttc'
  ];
  for (const f of candidates) {
    if (fs.existsSync(f)) return f;
  }
  return null;
}

module.exports = { generateReport };
