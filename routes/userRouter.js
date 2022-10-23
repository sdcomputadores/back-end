const router = require('express').Router()
const bcrypt = require('bcrypt')

const User = require('../models/user')

//middleware
const verifyToken = require('../helps/check-token.js')

//helps
const getUserByToken = require('../helps/get-user-by-token.js')


//get an user//  AQUI HA UM PROBLEMA //
router.get("/:id" , verifyToken ,  async (req, res) => {
    const id = req.params.id 

    //veri exist user
    try{
        const user = await User.findOne({_id: id }, {password: 0 })
        res.json({error: null, user})
    } catch(err){
        return res.status(400).json({error: "Usuario nao existe!"})
    }
    res.json({ error: null, user });
})
    //update an user 

    router.put('/', verifyToken , async (req, res) => {
        const token = req.header("auth-token")
        const user = await getUserByToken(token)
        const userReqId = req.body.id
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword

        const userId = user._id.toString()

        //check if user id is equal token user id
        if(userId != userReqId){
            res.status(401).json({erro: 'Acesso Negado  '})
        }
        //creat an user Object
        const updateData = {
            name: req.body.name,
            email: req.body.email
        }
        //check if password match
        if(password != confirmpassword){
            res.status(401).json({erro: 'Senhas diferentes'})
        //change password
        }else if(password == confirmpassword && password != null){
             //creat password
             const salt = await bcrypt.genSalt(12)
             const passwordHash = await bcrypt.hash(password, salt)

             //add password data
             updateData.password = passwordHash
        }
        try{
            //return update
            const updateUser = await User.findOneAndUpdate({_id: userId}, {$set: updateData},
                {new: true}) 
                req.json({error: null, msg: "Alterado com sucesso", data: updateUser })

        }catch(error){
            res.status(400).json({err})
        }
    })



module.exports = router