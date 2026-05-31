const Router = require('koa-router');
const userController = require('../controllers/userController');
const gearController = require('../controllers/gearController');
const messageController = require('../controllers/messageController');

const router = new Router({ prefix: '/api' });

router.post('/user/login', userController.login);
router.get('/user/:id', userController.getInfo);
router.get('/users', userController.list);

router.get('/gears', gearController.getList);
router.get('/gears/:id', gearController.getDetail);
router.post('/gears', gearController.create);
router.put('/gears/:id/status', gearController.updateStatus);
router.get('/user/:userId/gears', gearController.getMyGears);

router.get('/user/:userId/conversations', messageController.getConversations);
router.get('/user/:userId/conversations/:otherUserId/:gearId', messageController.getMessages);
router.post('/messages', messageController.sendMessage);
router.get('/user/:userId/unread', messageController.getUnreadCount);

module.exports = router;
