// 自动给菜谱打标签
const mysql = require('mysql2/promise')

const RULES = [
  { tag: '肉类', match: (r) => /肉|鸡|鸭|猪|牛|羊|排骨|里脊|五花|牛肚/.test(r.name + JSON.stringify(r.ingredients)) },
  { tag: '蔬菜', match: (r) => (r.ingredients || []).some(i => i.cat === '蔬菜') || /菜|瓜|豆|茄|椒|土豆|萝卜|西红柿/.test(r.name) },
  { tag: '海鲜', match: (r) => /鱼|虾|蟹|贝|鱿|海|水产/.test(r.name + JSON.stringify(r.ingredients)) },
  { tag: '面食', match: (r) => /面|粉|饼|饺|包|馒头/.test(r.name) || r.category_id === 5 },
  { tag: '甜点', match: (r) => r.category_id === 6 || /糕|甜|奶|糖|蜜|酥/.test(r.name) },
  { tag: '汤类', match: (r) => r.category_id === 4 || /汤/.test(r.name) },
  { tag: '小吃', match: (r) => r.category_id === 3 || /小吃|点心|零食|糍粑|凉拌|卤|腌/.test(r.name) },
  { tag: '早餐', match: (r) => /粥|饼|油条|豆浆|包子|馒头|蛋炒|早/.test(r.name) },
]

async function main() {
  const p = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', password: '123456', database: 'shiguang' })
  const [recipes] = await p.query('SELECT * FROM recipes')
  
  for (const r of recipes) {
    let tags = ['午餐', '晚餐'] // 默认都有
    try { r.ingredients = JSON.parse(r.ingredients || '[]') } catch (e) { r.ingredients = [] }
    for (const rule of RULES) {
      if (rule.match(r) && !tags.includes(rule.tag)) tags.push(rule.tag)
    }
    await p.query('UPDATE recipes SET tags=? WHERE id=?', [JSON.stringify(tags), r.id])
    console.log(r.name, '→', tags.join(','))
  }
  
  const [check] = await p.query("SELECT name, tags FROM recipes WHERE JSON_CONTAINS(tags,'\"早餐\"')")
  console.log('\n早餐:', check.map(r => r.name).join(', '))
  await p.end()
}
main()
