import json
import sqlite3
from flask import Flask, make_response, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)

DB_PATH = 'news.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS news_type (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT UNIQUE,
        name TEXT
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS news_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        has_image INTEGER DEFAULT 0,
        image_list TEXT,
        comment_count INTEGER DEFAULT 0,
        publish_time TEXT,
        category TEXT
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS video_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        video_url TEXT,
        poster TEXT,
        duration INTEGER DEFAULT 0,
        author TEXT,
        play_count INTEGER DEFAULT 0,
        publish_time TEXT
    )''')
    
    conn.commit()
    conn.close()

def insert_test_data():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('SELECT COUNT(*) FROM news_type')
    if c.fetchone()[0] == 0:
        types = [
            ('all', '热点'),
            ('1', '社会'),
            ('2', '娱乐'),
            ('3', '科技'),
            ('4', '汽车'),
            ('5', '财经')
        ]
        c.executemany('INSERT INTO news_type (category, name) VALUES (?, ?)', types)
    
    c.execute('SELECT COUNT(*) FROM news_list')
    if c.fetchone()[0] == 0:
        news = [
            ('标题1：今日热点新闻', 0, '', 5, '2020-03-09 9:25', 'all'),
            ('标题2：社会新闻报道', 0, '', 15, '2020-03-09 7:34', '1'),
            ('标题3：娱乐明星动态', 1, '["../../images/avatar.png","../../images/avatar.png","../../images/avatar.png"]', 25, '2020-03-08 19:25', '2'),
            ('标题4：科技前沿资讯', 0, '', 8, '2020-03-08 19:20', '3'),
            ('标题5：汽车新品发布', 1, '["../../images/avatar.png","../../images/avatar.png"]', 12, '2020-03-08 18:30', '4'),
            ('标题6：财经市场分析', 0, '', 20, '2020-03-08 16:00', '5')
        ]
        c.executemany('INSERT INTO news_list (title, has_image, image_list, comment_count, publish_time, category) VALUES (?, ?, ?, ?, ?, ?)', news)
    
    c.execute('SELECT COUNT(*) FROM video_list')
    if c.fetchone()[0] == 0:
        videos = [
            ('科技前沿：人工智能最新进展', 'http://www.w3school.com.cn/i/movie.mp4', '../../images/avatar.png', 120, '科技频道', 12580, '2020-03-09 10:30'),
            ('娱乐新闻：明星红毯秀', 'http://www.w3school.com.cn/i/movie.mp4', '../../images/avatar.png', 95, '娱乐快报', 23600, '2020-03-09 09:15'),
            ('汽车评测：新款SUV试驾体验', 'http://www.w3school.com.cn/i/movie.mp4', '../../images/avatar.png', 150, '汽车频道', 8900, '2020-03-08 18:45'),
            ('财经分析：今日股市行情', 'http://www.w3school.com.cn/i/movie.mp4', '../../images/avatar.png', 88, '财经资讯', 5600, '2020-03-08 16:20')
        ]
        c.executemany('INSERT INTO video_list (title, video_url, poster, duration, author, play_count, publish_time) VALUES (?, ?, ?, ?, ?, ?, ?)', videos)
    
    conn.commit()
    conn.close()

def make_resp(ret):
    resp = make_response(json.dumps(ret))
    resp.mimetype = 'application/json'
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/demo/news/type', methods=['GET', 'POST'])
def demo_news_type():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT category, name FROM news_type')
    rows = c.fetchall()
    result = [dict(row) for row in rows]
    conn.close()
    return make_resp(result)

@app.route('/demo/news/list', methods=['GET', 'POST'])
def demo_news_list():
    category = request.args.get('category', 'all') if request.method == 'GET' else request.form.get('category', 'all')
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    if category == 'all':
        c.execute('SELECT title, has_image, image_list, comment_count, publish_time FROM news_list')
    else:
        c.execute('SELECT title, has_image, image_list, comment_count, publish_time FROM news_list WHERE category = ?', (category,))
    
    rows = c.fetchall()
    result = []
    for row in rows:
        item = dict(row)
        item['has_image'] = bool(item['has_image'])
        if item['image_list']:
            item['image_list'] = json.loads(item['image_list'])
        else:
            item['image_list'] = []
        result.append(item)
    
    conn.close()
    return make_resp(result)

@app.route('/demo/video/list', methods=['GET', 'POST'])
def demo_video_list():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT id, title, video_url, poster, duration, author, play_count, publish_time FROM video_list')
    rows = c.fetchall()
    result = [dict(row) for row in rows]
    conn.close()
    return make_resp(result)

if __name__ == "__main__":
    init_db()
    insert_test_data()
    app.run(host='0.0.0.0', port=8888)