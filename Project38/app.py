import os
import uuid
from datetime import datetime
from functools import wraps

from flask import (
    Flask, render_template, request, redirect, url_for,
    session, flash, jsonify, send_from_directory, abort
)
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dialect-culture-platform-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(
    os.path.abspath(os.path.dirname(__file__)), 'instance', 'dialect.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['ALLOWED_AUDIO_EXTENSIONS'] = {'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'}
app.config['ALLOWED_IMAGE_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

db = SQLAlchemy(app)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance'), exist_ok=True)


class Region(db.Model):
    __tablename__ = 'regions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.Text, default='')
    cover_image = db.Column(db.String(200), default='')
    sort_order = db.Column(db.Integer, default=0)
    posts = db.relationship('DialectPost', backref='region_info', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'cover_image': self.cover_image,
            'post_count': self.posts.count()
        }


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password_hash = db.Column(db.String(200), nullable=False)
    nickname = db.Column(db.String(80), default='')
    avatar = db.Column(db.String(200), default='')
    bio = db.Column(db.Text, default='')
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    posts = db.relationship('DialectPost', backref='author', lazy='dynamic')
    comments = db.relationship('Comment', backref='commenter', lazy='dynamic')
    likes = db.relationship('Like', backref='liker', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'nickname': self.nickname or self.username,
            'avatar': self.avatar,
            'bio': self.bio,
            'post_count': self.posts.count(),
            'created_at': self.created_at.strftime('%Y-%m-%d') if self.created_at else ''
        }


class DialectPost(db.Model):
    __tablename__ = 'dialect_posts'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    audio_path = db.Column(db.String(300), default='')
    dialect_text = db.Column(db.Text, default='')
    translation = db.Column(db.Text, default='')
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    likes_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_approved = db.Column(db.Boolean, default=True)
    comments = db.relationship('Comment', backref='post', lazy='dynamic',
                               order_by='Comment.created_at.desc()')
    likes = db.relationship('Like', backref='post', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'audio_path': self.audio_path,
            'dialect_text': self.dialect_text,
            'translation': self.translation,
            'region_id': self.region_id,
            'region_name': self.region_info.name if self.region_info else '',
            'user_id': self.user_id,
            'author_name': self.author.nickname or self.author.username,
            'author_avatar': self.author.avatar,
            'likes_count': self.likes_count,
            'views_count': self.views_count,
            'comment_count': self.comments.count(),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else ''
        }


class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('dialect_posts.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'post_id': self.post_id,
            'user_id': self.user_id,
            'author_name': self.commenter.nickname or self.commenter.username,
            'author_avatar': self.commenter.avatar,
            'parent_id': self.parent_id,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else ''
        }


class Like(db.Model):
    __tablename__ = 'likes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('dialect_posts.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id'),)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('请先登录', 'warning')
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


def get_or_404(model, id):
    obj = db.session.get(model, id)
    if obj is None:
        abort(404)
    return obj


def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


@app.context_processor
def inject_user():
    if 'user_id' in session:
        user = db.session.get(User, session['user_id'])
        return {'current_user': user}
    return {'current_user': None}


@app.context_processor
def inject_regions():
    regions = Region.query.order_by(Region.sort_order).all()
    return {'all_regions': regions}


@app.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    region_id = request.args.get('region_id', type=int)
    keyword = request.args.get('keyword', '').strip()
    sort = request.args.get('sort', 'latest')

    query = DialectPost.query.filter_by(is_approved=True)

    if region_id:
        query = query.filter_by(region_id=region_id)

    if keyword:
        query = query.filter(
            db.or_(
                DialectPost.title.contains(keyword),
                DialectPost.dialect_text.contains(keyword),
                DialectPost.translation.contains(keyword),
                DialectPost.description.contains(keyword)
            )
        )

    if sort == 'hot':
        query = query.order_by(DialectPost.likes_count.desc(), DialectPost.views_count.desc())
    elif sort == 'views':
        query = query.order_by(DialectPost.views_count.desc())
    else:
        query = query.order_by(DialectPost.created_at.desc())

    per_page = 12
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    posts = pagination.items

    hot_posts = DialectPost.query.filter_by(is_approved=True).order_by(
        DialectPost.likes_count.desc()
    ).limit(5).all()

    return render_template('index.html',
                           posts=posts,
                           pagination=pagination,
                           hot_posts=hot_posts,
                           current_region=region_id,
                           keyword=keyword,
                           sort=sort)


@app.route('/region/<int:region_id>')
def region_detail(region_id):
    region = get_or_404(Region, region_id)
    page = request.args.get('page', 1, type=int)
    per_page = 12
    pagination = DialectPost.query.filter_by(
        region_id=region_id, is_approved=True
    ).order_by(DialectPost.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return render_template('region.html',
                           region=region,
                           posts=pagination.items,
                           pagination=pagination)


@app.route('/post/<int:post_id>')
def post_detail(post_id):
    post = get_or_404(DialectPost, post_id)
    post.views_count = (post.views_count or 0) + 1
    db.session.commit()

    comments = Comment.query.filter_by(post_id=post_id, parent_id=None).order_by(
        Comment.created_at.desc()
    ).all()

    comment_replies = {}
    for comment in comments:
        replies = Comment.query.filter_by(post_id=post_id, parent_id=comment.id).order_by(
            Comment.created_at.asc()
        ).all()
        comment_replies[comment.id] = replies

    is_liked = False
    if 'user_id' in session:
        like = Like.query.filter_by(user_id=session['user_id'], post_id=post_id).first()
        is_liked = like is not None

    return render_template('detail.html',
                           post=post,
                           comments=comments,
                           comment_replies=comment_replies,
                           is_liked=is_liked)


@app.route('/publish', methods=['GET', 'POST'])
@login_required
def publish():
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        dialect_text = request.form.get('dialect_text', '').strip()
        translation = request.form.get('translation', '').strip()
        region_id = request.form.get('region_id', type=int)

        if not title:
            flash('请输入标题', 'danger')
            return redirect(url_for('publish'))

        audio_path = ''
        if 'audio' in request.files:
            audio_file = request.files['audio']
            if audio_file and audio_file.filename and allowed_file(audio_file.filename, app.config['ALLOWED_AUDIO_EXTENSIONS']):
                ext = audio_file.filename.rsplit('.', 1)[1].lower()
                filename = f"{uuid.uuid4().hex}.{ext}"
                audio_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                audio_path = filename

        post = DialectPost(
            title=title,
            description=description,
            dialect_text=dialect_text,
            translation=translation,
            audio_path=audio_path,
            region_id=region_id,
            user_id=session['user_id'],
            is_approved=True
        )
        db.session.add(post)
        db.session.commit()
        flash('发布成功！', 'success')
        return redirect(url_for('post_detail', post_id=post.id))

    return render_template('publish.html')


@app.route('/post/<int:post_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_post(post_id):
    post = get_or_404(DialectPost, post_id)
    if post.user_id != session['user_id']:
        flash('无权编辑此内容', 'danger')
        return redirect(url_for('post_detail', post_id=post_id))

    if request.method == 'POST':
        post.title = request.form.get('title', '').strip()
        post.description = request.form.get('description', '').strip()
        post.dialect_text = request.form.get('dialect_text', '').strip()
        post.translation = request.form.get('translation', '').strip()
        post.region_id = request.form.get('region_id', type=int)

        if 'audio' in request.files:
            audio_file = request.files['audio']
            if audio_file and audio_file.filename and allowed_file(audio_file.filename, app.config['ALLOWED_AUDIO_EXTENSIONS']):
                if post.audio_path:
                    old_path = os.path.join(app.config['UPLOAD_FOLDER'], post.audio_path)
                    if os.path.exists(old_path):
                        os.remove(old_path)
                ext = audio_file.filename.rsplit('.', 1)[1].lower()
                filename = f"{uuid.uuid4().hex}.{ext}"
                audio_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                post.audio_path = filename

        db.session.commit()
        flash('修改成功！', 'success')
        return redirect(url_for('post_detail', post_id=post.id))

    return render_template('publish.html', post=post)


@app.route('/post/<int:post_id>/delete', methods=['POST'])
@login_required
def delete_post(post_id):
    post = get_or_404(DialectPost, post_id)
    if post.user_id != session['user_id']:
        flash('无权删除此内容', 'danger')
        return redirect(url_for('post_detail', post_id=post_id))

    if post.audio_path:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], post.audio_path)
        if os.path.exists(file_path):
            os.remove(file_path)

    Like.query.filter_by(post_id=post_id).delete()
    Comment.query.filter_by(post_id=post_id).delete()
    db.session.delete(post)
    db.session.commit()
    flash('删除成功', 'success')
    return redirect(url_for('index'))


@app.route('/post/<int:post_id>/like', methods=['POST'])
@login_required
def like_post(post_id):
    post = get_or_404(DialectPost, post_id)
    existing = Like.query.filter_by(
        user_id=session['user_id'], post_id=post_id
    ).first()

    if existing:
        db.session.delete(existing)
        post.likes_count = max(0, (post.likes_count or 0) - 1)
        db.session.commit()
        return jsonify({'liked': False, 'likes_count': post.likes_count})
    else:
        like = Like(user_id=session['user_id'], post_id=post_id)
        db.session.add(like)
        post.likes_count = (post.likes_count or 0) + 1
        db.session.commit()
        return jsonify({'liked': True, 'likes_count': post.likes_count})


@app.route('/post/<int:post_id>/comment', methods=['POST'])
@login_required
def add_comment(post_id):
    post = get_or_404(DialectPost, post_id)
    content = request.form.get('content', '').strip()
    parent_id = request.form.get('parent_id', type=int)

    if not content:
        flash('请输入评论内容', 'danger')
        return redirect(url_for('post_detail', post_id=post_id))

    comment = Comment(
        content=content,
        post_id=post_id,
        user_id=session['user_id'],
        parent_id=parent_id
    )
    db.session.add(comment)
    db.session.commit()
    flash('评论成功！', 'success')
    return redirect(url_for('post_detail', post_id=post_id))


@app.route('/comment/<int:comment_id>/delete', methods=['POST'])
@login_required
def delete_comment(comment_id):
    comment = get_or_404(Comment, comment_id)
    if comment.user_id != session['user_id']:
        flash('无权删除此评论', 'danger')
        return redirect(url_for('post_detail', post_id=comment.post_id))

    Comment.query.filter_by(parent_id=comment_id).delete()
    post_id = comment.post_id
    db.session.delete(comment)
    db.session.commit()
    flash('评论已删除', 'success')
    return redirect(url_for('post_detail', post_id=post_id))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()
        nickname = request.form.get('nickname', '').strip()

        if not username or not password:
            flash('请输入用户名和密码', 'danger')
            return redirect(url_for('register'))

        if len(username) < 3 or len(username) > 20:
            flash('用户名长度需在3-20个字符之间', 'danger')
            return redirect(url_for('register'))

        if len(password) < 6:
            flash('密码长度不能少于6个字符', 'danger')
            return redirect(url_for('register'))

        if password != confirm_password:
            flash('两次输入的密码不一致', 'danger')
            return redirect(url_for('register'))

        if User.query.filter_by(username=username).first():
            flash('该用户名已被注册', 'danger')
            return redirect(url_for('register'))

        user = User(username=username, nickname=nickname or username)
        user.set_password(password)

        if 'avatar' in request.files:
            avatar_file = request.files['avatar']
            if avatar_file and avatar_file.filename and allowed_file(avatar_file.filename, app.config['ALLOWED_IMAGE_EXTENSIONS']):
                ext = avatar_file.filename.rsplit('.', 1)[1].lower()
                filename = f"avatar_{uuid.uuid4().hex}.{ext}"
                avatar_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                user.avatar = filename

        db.session.add(user)
        db.session.commit()

        session['user_id'] = user.id
        session['username'] = user.username
        flash('注册成功！', 'success')
        return redirect(url_for('index'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        if not username or not password:
            flash('请输入用户名和密码', 'danger')
            return redirect(url_for('login'))

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('登录成功！', 'success')
            next_url = request.args.get('next') or url_for('index')
            return redirect(next_url)
        else:
            flash('用户名或密码错误', 'danger')
            return redirect(url_for('login'))

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    flash('已退出登录', 'info')
    return redirect(url_for('index'))


@app.route('/profile')
@login_required
def profile():
    user = db.session.get(User, session['user_id'])
    page = request.args.get('page', 1, type=int)
    per_page = 10
    pagination = DialectPost.query.filter_by(user_id=user.id).order_by(
        DialectPost.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('profile.html', user=user, posts=pagination.items, pagination=pagination)


@app.route('/profile/edit', methods=['GET', 'POST'])
@login_required
def edit_profile():
    user = db.session.get(User, session['user_id'])

    if request.method == 'POST':
        nickname = request.form.get('nickname', '').strip()
        bio = request.form.get('bio', '').strip()
        region_id = request.form.get('region_id', type=int)

        user.nickname = nickname or user.username
        user.bio = bio
        user.region_id = region_id

        if 'avatar' in request.files:
            avatar_file = request.files['avatar']
            if avatar_file and avatar_file.filename and allowed_file(avatar_file.filename, app.config['ALLOWED_IMAGE_EXTENSIONS']):
                if user.avatar:
                    old_path = os.path.join(app.config['UPLOAD_FOLDER'], user.avatar)
                    if os.path.exists(old_path):
                        os.remove(old_path)
                ext = avatar_file.filename.rsplit('.', 1)[1].lower()
                filename = f"avatar_{uuid.uuid4().hex}.{ext}"
                avatar_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                user.avatar = filename

        db.session.commit()
        flash('资料更新成功！', 'success')
        return redirect(url_for('profile'))

    return render_template('edit_profile.html', user=user)


@app.route('/user/<int:user_id>')
def user_profile(user_id):
    user = get_or_404(User, user_id)
    page = request.args.get('page', 1, type=int)
    per_page = 10
    pagination = DialectPost.query.filter_by(user_id=user_id).order_by(
        DialectPost.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('profile.html', user=user, posts=pagination.items, pagination=pagination)


@app.route('/search')
def search():
    keyword = request.args.get('q', '').strip()
    if not keyword:
        return redirect(url_for('index'))
    page = request.args.get('page', 1, type=int)
    per_page = 12
    pagination = DialectPost.query.filter(
        DialectPost.is_approved == True,
        db.or_(
            DialectPost.title.contains(keyword),
            DialectPost.dialect_text.contains(keyword),
            DialectPost.translation.contains(keyword),
            DialectPost.description.contains(keyword)
        )
    ).order_by(DialectPost.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return render_template('index.html',
                           posts=pagination.items,
                           pagination=pagination,
                           keyword=keyword,
                           hot_posts=[],
                           current_region=None,
                           sort='latest')


def init_db():
    db.create_all()

    if Region.query.first() is not None:
        return

    regions_data = [
        {'name': '东北官话', 'description': '分布于东北三省及内蒙古东部，包括黑龙江、吉林、辽宁等地，语调豪爽幽默', 'sort_order': 1},
        {'name': '北京官话', 'description': '以北京语音为标准音，分布于北京、河北北部等地，儿化音丰富', 'sort_order': 2},
        {'name': '冀鲁官话', 'description': '分布于河北、山东等地，语调朴实浑厚', 'sort_order': 3},
        {'name': '胶辽官话', 'description': '分布于山东半岛和辽东半岛，声调独特', 'sort_order': 4},
        {'name': '中原官话', 'description': '分布于河南、陕西、甘肃等地，历史悠久，古韵犹存', 'sort_order': 5},
        {'name': '兰银官话', 'description': '分布于甘肃、宁夏等地，声调系统独特', 'sort_order': 6},
        {'name': '西南官话', 'description': '分布于四川、重庆、云南、贵州、湖北等地，覆盖范围广', 'sort_order': 7},
        {'name': '江淮官话', 'description': '分布于安徽、江苏长江以北等地，保留入声', 'sort_order': 8},
        {'name': '吴语', 'description': '分布于上海、浙江、江苏南部等地，保留浊音，语调婉转', 'sort_order': 9},
        {'name': '徽语', 'description': '分布于安徽徽州地区，兼具吴语和赣语特点', 'sort_order': 10},
        {'name': '赣语', 'description': '分布于江西、湖南东部等地，保留古音特色', 'sort_order': 11},
        {'name': '湘语', 'description': '分布于湖南大部分地区，语调独特，新老湘语差异明显', 'sort_order': 12},
        {'name': '闽语', 'description': '分布于福建、台湾、广东潮汕等地，分支众多，保留古汉语特征最多', 'sort_order': 13},
        {'name': '粤语', 'description': '分布于广东、广西、香港、澳门等地，声调丰富，保留入声', 'sort_order': 14},
        {'name': '客家话', 'description': '分布于广东梅州、江西赣州、福建龙岩等地，保留中原古音', 'sort_order': 15},
    ]

    for r in regions_data:
        region = Region(name=r['name'], description=r['description'], sort_order=r['sort_order'])
        db.session.add(region)

    demo_users = [
        {'username': 'xiaobei', 'nickname': '小北', 'password': '123456', 'bio': '东北话十级学者，致力于方言文化传播', 'region_idx': 0},
        {'username': 'laowu', 'nickname': '老吴', 'password': '123456', 'bio': '吴语爱好者，上海本地人', 'region_idx': 8},
        {'username': 'chuange', 'nickname': '川哥', 'password': '123456', 'bio': '四川话推广大使', 'region_idx': 6},
        {'username': 'yueyueming', 'nickname': '粤明', 'password': '123456', 'bio': '粤语文化传承人', 'region_idx': 13},
        {'username': 'minren', 'nickname': '闽人', 'password': '123456', 'bio': '闽南语研究者', 'region_idx': 12},
    ]

    users = []
    for u in demo_users:
        user = User(username=u['username'], nickname=u['nickname'], bio=u['bio'])
        user.set_password(u['password'])
        user.region_id = u['region_idx'] + 1
        db.session.add(user)
        users.append(user)

    db.session.flush()

    sample_posts = [
        {
            'title': '东北话经典：你嘎哈呢？',
            'description': '东北话里最常用的问候语之一，"嘎哈"就是"干什么"的意思，语气豪爽直接，是东北人日常交流的标配。',
            'dialect_text': '你嘎哈呢？整点儿啥不？',
            'translation': '你在干什么呢？要不要做点什么？',
            'user_idx': 0, 'region_idx': 0
        },
        {
            'title': '上海话日常问候',
            'description': '上海话是吴语的代表方言之一，语调温婉动听。学会基本的上海话问候，能让你在上海如鱼得水。',
            'dialect_text': '侬好！长远勿见，侬最近哪能？',
            'translation': '你好！好久不见，你最近怎么样？',
            'user_idx': 1, 'region_idx': 8
        },
        {
            'title': '四川话里的巴适得板',
            'description': '"巴适"是四川话中最具代表性的词语，表示舒服、满意、很好。"巴适得板"就是非常舒服、非常满意的意思。',
            'dialect_text': '今天这个火锅吃得太巴适得板了！',
            'translation': '今天这个火锅吃得太舒服了！',
            'user_idx': 2, 'region_idx': 6
        },
        {
            'title': '粤语经典：食饭未啊？',
            'description': '粤语是岭南文化的载体，广东人见面最常问的就是"食饭未啊"，这是最朴素也最温暖的问候。',
            'dialect_text': '食饭未啊？一齐去饮茶啦！',
            'translation': '吃饭了吗？一起去喝茶吧！',
            'user_idx': 3, 'region_idx': 13
        },
        {
            'title': '闽南语：呷饱未？',
            'description': '闽南语保留了古汉语的诸多特征，"呷饱未"是闽南人最常说的问候语，体现了闽南文化的热情好客。',
            'dialect_text': '呷饱未？来去泡茶讲古！',
            'translation': '吃饱了吗？去泡茶聊天！',
            'user_idx': 4, 'region_idx': 12
        },
        {
            'title': '东北话里的唠嗑文化',
            'description': '东北人最爱唠嗑，唠嗑不仅是聊天，更是一种社交文化。东北人唠嗑幽默风趣，充满生活智慧。',
            'dialect_text': '来来来，坐下唠唠嗑，别客气！',
            'translation': '来来来，坐下来聊天，别客气！',
            'user_idx': 0, 'region_idx': 0
        },
        {
            'title': '成都话：要得！',
            'description': '"要得"是成都话中最常用的应答词，表示同意、可以。成都人说话慢悠悠的，"要得"一词更是透着一股悠闲劲儿。',
            'dialect_text': '明天去看电影嘛？要得！',
            'translation': '明天去看电影吗？好的！',
            'user_idx': 2, 'region_idx': 6
        },
        {
            'title': '粤语歇后语精选',
            'description': '粤语歇后语幽默风趣，是粤语文化的精华。如"牛皮灯笼——点极都唔明"，形容人不开窍。',
            'dialect_text': '佢真系牛皮灯笼，点极都唔明！',
            'translation': '他真是不开窍，怎么点拨都不明白！',
            'user_idx': 3, 'region_idx': 13
        },
        {
            'title': '吴语苏州话：好白相',
            'description': '苏州话被称为"吴侬软语"，是吴语中最柔美的代表。"好白相"意为好玩、有趣，是苏州话中极具特色的表达。',
            'dialect_text': '个只地方蛮好白相个，阿要去看看？',
            'translation': '那个地方挺好玩的，要不要去看看？',
            'user_idx': 1, 'region_idx': 8
        },
        {
            'title': '客家话的传承与保护',
            'description': '客家话是汉语方言中保留古音最多的方言之一，随着现代化进程，客家话的传承面临挑战。让我们一起来保护和传承客家文化。',
            'dialect_text': '食饭喽，转屋下食饭！',
            'translation': '吃饭了，回家吃饭！',
            'user_idx': 4, 'region_idx': 14
        },
        {
            'title': '北京话儿化音大全',
            'description': '北京话的儿化音是其最显著的特色之一，从"花儿"到"玩儿"，儿化音渗透在北京人日常生活的方方面面。',
            'dialect_text': '今儿个天儿不错，遛弯儿去吧！',
            'translation': '今天天气不错，去散步吧！',
            'user_idx': 0, 'region_idx': 1
        },
        {
            'title': '湖南话：你搞么子咯？',
            'description': '湘语以湖南话为代表，"搞么子"是湖南人最常说的口头禅，意为"干什么"，语调铿锵有力。',
            'dialect_text': '你搞么子咯？冒事搞恰饭去！',
            'translation': '你在干什么呢？没事就去吃饭！',
            'user_idx': 2, 'region_idx': 11
        },
    ]

    for p in sample_posts:
        post = DialectPost(
            title=p['title'],
            description=p['description'],
            dialect_text=p['dialect_text'],
            translation=p['translation'],
            region_id=p['region_idx'] + 1,
            user_id=users[p['user_idx']].id,
            likes_count=0,
            views_count=0,
            is_approved=True
        )
        db.session.add(post)

    db.session.flush()

    sample_comments = [
        {'post_idx': 0, 'user_idx': 1, 'content': '哈哈，东北话太有意思了！'},
        {'post_idx': 0, 'user_idx': 2, 'content': '嘎哈这个词太经典了'},
        {'post_idx': 1, 'user_idx': 0, 'content': '吴侬软语，好听好听！'},
        {'post_idx': 2, 'user_idx': 1, 'content': '巴适得很！作为一个四川人表示非常准确'},
        {'post_idx': 2, 'user_idx': 3, 'content': '四川话真的太有感染力了'},
        {'post_idx': 3, 'user_idx': 2, 'content': '粤语真的好听，食饭未啊朋友'},
        {'post_idx': 4, 'user_idx': 3, 'content': '闽南语和粤语的渊源很深啊'},
        {'post_idx': 5, 'user_idx': 2, 'content': '东北唠嗑文化确实厉害'},
        {'post_idx': 6, 'user_idx': 0, 'content': '要得！成都人就是悠闲'},
        {'post_idx': 7, 'user_idx': 4, 'content': '粤语歇后语太有智慧了'},
        {'post_idx': 8, 'user_idx': 2, 'content': '苏州话真的好听，软绵绵的'},
        {'post_idx': 9, 'user_idx': 0, 'content': '客家文化需要更多人关注和保护'},
        {'post_idx': 10, 'user_idx': 1, 'content': '儿化音是北京话的灵魂！'},
        {'post_idx': 11, 'user_idx': 1, 'content': '湖南话听起来就很霸蛮'},
    ]

    for c in sample_comments:
        comment = Comment(
            content=c['content'],
            post_id=c['post_idx'] + 1,
            user_id=users[c['user_idx']].id
        )
        db.session.add(comment)

    import random
    for post_idx in range(len(sample_posts)):
        post_id = post_idx + 1
        like_users = random.sample(range(1, len(users) + 1), min(3, len(users)))
        for uid in like_users:
            like = Like(user_id=uid, post_id=post_id)
            db.session.add(like)
            p = db.session.get(DialectPost, post_id)
            if p:
                p.likes_count = len(like_users)
                p.views_count = random.randint(10, 200)

    db.session.commit()
    print('Database initialized with sample data.')


with app.app_context():
    init_db()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
