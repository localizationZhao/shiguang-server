const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const pool = mysql.createPool({
  host: '10.32.100.251', port: 3306, user: 'root', password: 'XjYwcMb9',
  database: 'shiguang', waitForConnections: true, connectionLimit: 10,
})

app.get('/api/test', async (req, res) => {
  try { const [r] = await pool.query('SELECT 1+1 AS n'); res.json({ code: 0, data: r }) }
  catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.get('/api/recipes', async (req, res) => {
  try {
    const { keyword, tag } = req.query
    let sql = 'SELECT * FROM recipes WHERE is_draft=0'
    const p = []
    if (keyword) { sql += ' AND name LIKE ?'; p.push('%' + keyword + '%') }
    if (tag) { sql += ' AND JSON_CONTAINS(tags, ?)'; p.push(JSON.stringify(tag)) }
    const [r] = await pool.query(sql + ' ORDER BY id DESC', p)
    r.forEach(x => {
      try { x.tags = JSON.parse(x.tags || '[]') } catch (e) { x.tags = [] }
      try { x.ingredients = JSON.parse(x.ingredients || '[]') } catch (e) { x.ingredients = [] }
      try { x.steps = JSON.parse(x.steps || '[]') } catch (e) { x.steps = [] }
    })
    res.json({ code: 0, data: r })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const [r] = await pool.query('SELECT * FROM recipes WHERE id=?', [req.params.id])
    if (r[0]) {
      try { r[0].ingredients = JSON.parse(r[0].ingredients || '[]') } catch (e) { r[0].ingredients = [] }
      try { r[0].steps = JSON.parse(r[0].steps || '[]') } catch (e) { r[0].steps = [] }
    }
    res.json({ code: 0, data: r[0] || null })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.post('/api/recipes', async (req, res) => {
  try {
    const r = req.body
    const [result] = await pool.query(
      'INSERT INTO recipes (name,category_id,color,price,ingredients,steps,reference,cover_img,cover_emoji,is_public,is_draft,user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [r.name, r.category_id, r.color, r.price, JSON.stringify(r.ingredients || []), JSON.stringify(r.steps || []), r.reference, r.cover_img, r.cover_emoji, r.is_public || 0, r.is_draft || 0, r.user_id || null]
    )
    res.json({ code: 0, data: { id: result.insertId } })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const r = req.body
    await pool.query('UPDATE recipes SET name=?,category_id=?,color=?,price=?,ingredients=?,steps=?,reference=?,cover_img=?,cover_emoji=?,is_draft=? WHERE id=?',
      [r.name, r.category_id, r.color, r.price, JSON.stringify(r.ingredients || []), JSON.stringify(r.steps || []), r.reference, r.cover_img, r.cover_emoji, r.is_draft || 0, req.params.id])
    res.json({ code: 0, msg: 'ok' })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.delete('/api/recipes/:id', async (req, res) => {
  try { await pool.query('DELETE FROM recipes WHERE id=?', [req.params.id]); res.json({ code: 0, msg: 'ok' }) }
  catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.get('/api/categories', async (req, res) => {
  try { const [r] = await pool.query('SELECT * FROM categories ORDER BY sort'); res.json({ code: 0, data: r }) }
  catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.get('/api/restaurants', async (req, res) => {
  try { const [r] = await pool.query('SELECT * FROM restaurants'); res.json({ code: 0, data: r }) }
  catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.post('/api/restaurants', async (req, res) => {
  try {
    const r = req.body
    const code = 'SG' + Date.now().toString(36).toUpperCase().slice(-6)
    const [result] = await pool.query('INSERT INTO restaurants (name,invite_code,owner_id) VALUES (?,?,?)', [r.name, code, r.owner_id])
    res.json({ code: 0, data: { id: result.insertId, invite_code: code } })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

// 通过邀请码查餐厅
app.get('/api/restaurants/by-code/:code', async (req, res) => {
  try {
    const [r] = await pool.query('SELECT * FROM restaurants WHERE invite_code=?', [req.params.code])
    res.json({ code: 0, data: r[0] || null })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.get('/api/orders', async (req, res) => {
  try { const [r] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC'); res.json({ code: 0, data: r }) }
  catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.post('/api/orders', async (req, res) => {
  try {
    const o = req.body
    const [result] = await pool.query('INSERT INTO orders (restaurant_id,customer_id,items) VALUES (?,?,?)',
      [o.restaurant_id, o.customer_id, JSON.stringify(o.items || [])])
    res.json({ code: 0, data: { id: result.insertId } })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.put('/api/orders/:id', async (req, res) => {
  try {
    const o = req.body
    await pool.query('UPDATE orders SET status=?,urge_count=?,rating=?,review=?,review_featured=? WHERE id=?',
      [o.status, o.urge_count || 0, o.rating, o.review, o.review_featured || 0, req.params.id])
    res.json({ code: 0, msg: 'ok' })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.get('/api/feeds', async (req, res) => {
  try { const [r] = await pool.query('SELECT * FROM feeds ORDER BY created_at DESC'); res.json({ code: 0, data: r }) }
  catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.post('/api/feeds', async (req, res) => {
  try {
    const f = req.body
    const [result] = await pool.query(
      'INSERT INTO feeds (user_id,content,images,restaurant_name,poster_role,visibility,show_location,is_location_public,location,loc_precision,custom_location,is_time_public) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [f.user_id, f.content, JSON.stringify(f.images || []), f.restaurant_name, f.poster_role, f.visibility, f.show_location, f.is_location_public, f.location, f.loc_precision, f.custom_location, f.is_time_public]
    )
    res.json({ code: 0, data: { id: result.insertId } })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.get('/api/favorites', async (req, res) => {
  try {
    const [r] = await pool.query('SELECT r.* FROM favorites f JOIN recipes r ON f.recipe_id=r.id WHERE f.user_id=?', [req.query.user_id])
    res.json({ code: 0, data: r })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

app.get('/api/cooking-records', async (req, res) => {
  try {
    const [r] = await pool.query('SELECT * FROM cooking_records WHERE user_id=? ORDER BY cooked_at DESC', [req.query.user_id])
    res.json({ code: 0, data: r })
  } catch (e) { res.json({ code: -1, msg: e.message }) }
})

// 自动建表+种子数据
async function autoSeed() {
  const [t] = await pool.query("SHOW TABLES LIKE 'recipes'")
  if (t.length === 0) {
    console.log('创建表结构...')
    await pool.query(`CREATE TABLE IF NOT EXISTS recipes (id INT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(50),category_id INT,color VARCHAR(10),price DECIMAL(8,2),ingredients JSON,steps JSON,tags JSON,cover_emoji VARCHAR(20),is_public TINYINT DEFAULT 1,is_draft TINYINT DEFAULT 0,user_id INT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`)
  }
  const [c] = await pool.query('SELECT COUNT(*) as n FROM recipes')
  if (c[0].n === 0) {
    console.log('写入种子数据...')
    await pool.query(`INSERT INTO recipes (name,category_id,color,price,tags,ingredients,steps,cover_emoji) VALUES
('宫保鸡丁',1,'#ff8baa',38,'["午餐","晚餐","荤菜"]','[{"name":"鸡胸肉","amount":"300g"}]','[{"text":"鸡胸肉切丁腌制"}]','🍗'),
('麻婆豆腐',2,'#79bcff',22,'["午餐","晚餐","素菜"]','[{"name":"嫩豆腐","amount":"1块"}]','[{"text":"豆腐焯水"}]','🧈'),
('清蒸鲈鱼',1,'#ff8baa',58,'["午餐","晚餐","海鲜菜"]','[{"name":"鲈鱼","amount":"1条"}]','[{"text":"鲈鱼处理干净"}]','🐟'),
('番茄鸡蛋汤',4,'#ffb37c',15,'["午餐","晚餐","汤羹"]','[{"name":"番茄","amount":"2个"}]','[{"text":"番茄切块"}]','🍅'),
('蛋炒饭',5,'#6de192',18,'["早餐","午餐","面食"]','[{"name":"米饭","amount":"2碗"}]','[{"text":"鸡蛋打散"}]','🍚'),
('红烧排骨',1,'#ff8baa',48,'["午餐","晚餐","荤菜"]','[{"name":"猪小排","amount":"500g"}]','[{"text":"排骨焯水"}]','🍖'),
('蒜蓉西蓝花',2,'#79bcff',16,'["午餐","晚餐","素菜"]','[{"name":"西蓝花","amount":"1颗"}]','[{"text":"西蓝花焯水"}]','🥦'),
('芒果慕斯',6,'#6de192',35,'["甜点","风味小吃"]','[{"name":"芒果","amount":"2个"}]','[{"text":"芒果打成泥"}]','🥭')`)
    console.log('种子数据完成')
  }
}
autoSeed()

app.listen(3000, () => console.log('食光服务器: http://localhost:3000'))
