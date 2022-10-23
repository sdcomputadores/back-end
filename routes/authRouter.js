const router = require('express').Router()
const bcrypt = require('bcrypt')

//const { Router } = require('express')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

//register an user
router.post('/register', async (req, res)=>{
    const name = req.body.nome
    const email = req.body.email
    const password = req.body.senha
    const confirmpassword = req.body.confirm_senha
    console.log(req.body)

    //check for require fiels 
    if(name === null || email === null || password === null || confirmpassword === null) {
        return res.status(400).json({ error: "Por favor, preencha todos os campos." });
    }
    //chech if password math  
    if(password != confirmpassword){
        return res.status(400).json({error: "As senhas nao conferem"})
    }
    //check if user existe
    const emailExists = await User.findOne({email: email})
    if (emailExists){
        return res.status(400).json({error: "O Email informado ja está em uso"})
    }
    // create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(reqPassword, salt)


        const user = new User({
            name: name,
            email: email,
            password: passwordHash
        })
        try {
            const newUser = await user.save()

            // create token
            const token = jwt.sing(
            //payload
            { 
                name: newUser.name,
                id: newUser._id
            },
            "nossosecret"
            )
            //return token
            res.json({error: null , msg:"Você realizou o cadastro com sucesso",
                 
                  token: token, userId: newUser._id})
                   
        }catch(error){
            res.status(400).json({error})
        }
})

//login user
router.post('/login', async (req, res)=> {
    const email = req.body.email
    const password = req.body.password

    // check user exist
    const user = await User.findOne({email: email})

    if(!user){
        return res.status(400).json({error: "Este usuario nao está cadastrado"})
    }
    //check if password match
    const checkPassword = await bcrypt.compare(password , user.password)

    if(!checkPassword){
        return res.status(400).json({error: "Senha ìnvalida"})
    }
       // create token
   const token = jwt.sing(
     //payload
     { 
         name: user.name,
         id:user._id
     },
     "nossosecret"
     )
     //return token
     res.json({error: null , msg: "Você etá autenticado",
      token: token, userId: user._id})

        

})

module.exports = router