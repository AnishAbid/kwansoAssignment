require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
app.use(express.json())
const JsonDB =  require('node-json-db').JsonDB;
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config
var randomize = require('randomatic');
var db = new JsonDB(new Config("myDataBase", true, true, '/'));

app.get('/user', authenticateToken, (req,res)=>{
    let data = db.getData("/users");
res.json(data.filter(user =>
    {

        if(user.email === req.user.email) return user
    }
    ))
})
app.post('/register',(req,res)=>{
let newOBJ={
    email:req.body.email,
    password:req.body.password,
    id:randomize('0000')
}
    db.push("/users",[newOBJ],true);
    res.send({ user: newOBJ })
})
app.post('/login',validateuser,(req,res)=>{
    //authenticate user
    const email = req.body.email
    const password = req.body.password
    const user = {email:email,password:password}
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    const refreshToken = jwt.sign(user,process.env.REFESH_TOKEN_SECRET)
    res.json({accessToken: accessToken,refreshToken:refreshToken})
})
app.post('/create-task',authenticateToken,(req,res)=>{
    let newTask= {
        name:req.body.name,
        id:randomize('0000')
    }
    db.push("/tasks",[newTask],true);
    let data = db.getData("/tasks");
    res.send( { task: newTask })

})
app.get('/list-tasks',authenticateToken,(req,res)=>{
    let data = db.getData("/tasks");
    res.json({tasks:data})
})
function authenticateToken(req,res,next){
const authHeader= req.headers['authorization']
const token  = authHeader && authHeader.split(' ')[1]
if(token === null) return res.sendStatus(401)

jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
    if(err) return res.sendStatus(403)
    console.log('auth user : ',user)
    req.user = user
    next()

})
}
function validateuser(req,res,next){
    let data = db.getData("/users");
    if(data.length>0){
    for(let i=0; i<=data.length;i++){
        let user = data[i]
        if(user.email === req.body.email && user.email === req.body.email ){
            next()
            break
        }else{
            return res.sendStatus(403)
        }
    }
}else{
    return res.sendStatus(403)
}
}      


app.listen(42000)
