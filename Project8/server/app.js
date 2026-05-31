const Koa = require('koa');
const { koaBody } = require('koa-body');
const koaStatic = require('koa-static');
const path = require('path');
const cors = require('@koa/cors');
const sequelize = require('./config/database');
const routes = require('./routes');

const app = new Koa();
const PORT = 3000;

app.use(cors());
app.use(koaBody({
  multipart: true,
  jsonLimit: '10mb'
}));
app.use(koaStatic(path.join(__dirname, '../public')));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || '服务器内部错误'
    };
    console.error(err);
  }
});

app.use(routes.routes()).use(routes.allowedMethods());

app.use(async (ctx) => {
  if (ctx.path === '/' || ctx.path === '') {
    ctx.type = 'text/html';
    ctx.body = require('fs').readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  }
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ alter: false });
    console.log('Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
