const User = require('../models/User');

exports.login = async (ctx) => {
  const { username, phone } = ctx.request.body;

  if (!username || !phone) {
    ctx.status = 400;
    ctx.body = { success: false, message: '请输入用户名和手机号' };
    return;
  }

  let user = await User.findOne({ where: { username } });

  if (user) {
    if (user.phone !== phone) {
      ctx.status = 400;
      ctx.body = { success: false, message: '手机号不正确' };
      return;
    }
  } else {
    user = await User.create({
      username,
      phone,
      avatar: ''
    });
  }

  ctx.body = {
    success: true,
    data: user
  };
};

exports.getInfo = async (ctx) => {
  const { id } = ctx.params;
  const user = await User.findByPk(id);

  if (!user) {
    ctx.status = 404;
    ctx.body = { success: false, message: '用户不存在' };
    return;
  }

  ctx.body = {
    success: true,
    data: user
  };
};

exports.list = async (ctx) => {
  const users = await User.findAll({
    attributes: ['id', 'username']
  });

  ctx.body = {
    success: true,
    data: users
  };
};
