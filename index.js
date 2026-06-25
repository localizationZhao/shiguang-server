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

app.listen(3000, () => console.log('食光服务器: http://localhost:3000'))
