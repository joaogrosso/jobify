const express = require('express')
const app = express()
const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite',{ Promise })
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000

app.set('view engine','ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))

app.get('/',async(request, response) => {
    const db = await dbConnection
    const categoriasDb =  await db.all('select * from categorias;')
    const vagas = await db.all('select * from vagas;')
    const categorias = categoriasDb.map(cat =>{
        return {
            ...cat,
            vagas : vagas.filter( vaga => vaga.categoria === cat.id)
        }
    })
    response.render('home', {
        categorias
    })
}) 
app.get('/vaga/:id',async(request, response) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = '+ request.params.id)
    response.render('vaga', {
        vaga
    })
})

app.get('/admin',(req,res)=>{
    res.render('admin/home')
})

app.get('/admin/vagas',async(req,res)=>{
    const db = await dbConnection
    const vagas = await db.all('select * from vagas;')
    res.render('admin/vagas', {vagas})
})

app.get('/admin/vaga/delete/:id',async(req,res)=>{
    const db = await dbConnection
    await db.run('delete from vagas where id ='+ req.params.id)
    res.redirect('/admin/vagas')
})

app.get('/admin/vaga/nova/',async(req,res)=>{
    const db = await dbConnection
    const categoria = await db.all('select * from categorias')
    res.render('admin/nova-vaga', {categoria})

})

app.get('/admin/vaga/editar/:id',async(req,res)=>{
    const db = await dbConnection
    const categoria = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id ='+ req.params.id)
    res.render('admin/editar-vaga', {categoria, vaga})
})

app.post('/admin/vaga/nova',async(req,res)=>{
    const {titulo,descricao,categoria} = req.body
    const db = await dbConnection
    await db.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}', '${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas')

})

app.post('/admin/vaga/editar/:id',async(req,res)=>{
    const {titulo,descricao,categoria} = req.body
    const id = req.params.id
    const db = await dbConnection
    await db.run(`update vagas set categoria = '${categoria}' , titulo = '${titulo}', descricao = '${descricao}' where id = ${id}`)
    res.redirect('/admin/vagas')

})

app.get('/admin/categorias', async(req,res)=>{
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    res.render('admin/categorias', {categorias})

})

app.get('/admin/categorias/delete/:id',async(req,res)=>{
    const db = await dbConnection
    await db.run('delete from categorias where id ='+ req.params.id)
    res.redirect('/admin/categorias')
})

app.get('/admin/categoria/nova/',async(req,res)=>{
    const db = await dbConnection
    const categoria = await db.all('select * from categorias')
    res.render('admin/nova-categoria', {categoria})

})

app.post('/admin/categoria/nova',async(req,res)=>{
    const {categoria} = req.body
    const db = await dbConnection
    await db.run(`insert into categorias(categoria) values('${categoria}')`)
    res.redirect('/admin/categorias')

})

app.get('/admin/categorias/editar/:id',async(req,res)=>{
    const db = await dbConnection
    const categoria = await db.all('select * from categorias')
    const id = await db.get('select * from categorias where id ='+ req.params.id)
    res.render('admin/editar-categoria', {categoria, id})
})

app.post('/admin/categorias/editar/:id',async(req,res)=>{
    const {categoria} = req.body
    const id = req.params.id
    const db = await dbConnection
    await db.run(`update categorias set categoria = '${categoria}' where id = ${id}`)
    res.redirect('/admin/categorias')

})

const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    //const categoria = 'Marketing Team'
    //await db.run(`insert into categorias(categoria) values('${categoria}')`)
    //const vaga = 'Fullstack Developer (Remote)'
    //const descricao = 'Vaga para dev do FullStack Lab'
    //await db.run(`insert into vagas(categoria, titulo, descricao) values(1, '${vaga}', '${descricao}')`)
}
init()

app.listen(port, (err) => {
    if(err){
        console.log('Nao foi possivel iniciar o Jobify')
    }else{
        console.log('Servidor do Jobify ON')
    }
})

