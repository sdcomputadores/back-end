const router = require('express').Router()
const jwt = require('jsonwebtoken')
const multer = require('multer')

const Party = require('../models/party')
const User = require('../models/user')
// define file storage
const diskStorage = require('../helps/file-storage')
const upload = multer({storage: diskStorage})

//midlleware
const verifyToken = require('../helps/check-token')

//hepers
const getUserByToken = require('../helps/get-user-by-token')
const { update } = require('../models/user')

// create new party
router.post('/', verifyToken,upload.fields([{nome: 'photos'}]), async (req, res)=>{
    
    //req data
    const title = req.body.title
    const description = req.body.descrition
    const partyDate = req.body.party_date

    let files = []

    if(req.files){
        files = req.files.photos
    }

    if(title == "null" || description == 'null'|| partyDate == 'null' ){
        return res.status(400).json({ error: "Preencha ao od campos! "})
    }

    //verify token 
    const token = req.header('auth-token')
    const userByToken = await getUserByToken(token)
    const userId = userByToken._id.toSting()
    try{
        const user = await User.findOne({_id: userId})
       

        // creat photo array with image path
        let photos =  [ ]

        if(files && files.length > 0 ){
            files.forEach((photo, i ) => {
                photos[i] = photo.path
            })
        }
        const Party = new Party({
            title: title,
            descrition: descrition,
            partyDate: partyDate,
            photos: photos, 
            privacy: req.body.privacy,
            userId: user._id.toString()

        })
        try{
            const newParty = await parties.save()
            res.json({error: null, msg: "Evento criado com suceso!", data: newParty})
        }catch(err){
            return res.status(400).json({ error})
        }


    }catch (err){

        return res.status(400).json({ error: "Acesso negado "})
    }




})

router.get("/", async (req, res) => {
    try{
        const parties = await Loja.find({privact: false}).sort ([[" _id", -1]])
        res.json({error: null, parties: parties})
    }catch (err) {
        return res.status(400).json({ error: "Acesso negado" })
    }
})


 // get all public parties
router.get('/all', async (req, res) => {
     try{
        const parties = await Lojas.find({privacy: true}).sort([['_id', -1]])
        res.json({error: null, parties: parties})
     
    }catch (err) {
        return res.status(400).json({ error })
     }
})

// get all user parties
router.get("/userparties", verifyToken, async ( req, res) => {
    try{
        const token = req.header('auth-token')

        const user = await getUserByToken(token)

        const userId = user._id.toSting()

        const parties = await Loja.find({userId: userId})
        res.json({error: null, produto: produto})



    }catch (error){
        return res.status(400).json({error}) 
    }
})
// get user party
router.get("/userparty/:id", verifyToken, async (req, res)=>{
    try{
        const token = req.header('autch-token')
        const user = await getUserByToken(token)
        const userId = user._id.toString()
        const partyId = req.params.id 

        const party = await Party.findOne({_id: partyId ,userId: userId })

        res.json({ error : null, party: party})


    }catch (error){
        return res.status(400).json({error})

    }


})
// get party (public or private)
router.get("/:id", async (req, res)=>{

    try{
           //find party
    const  id = req.params.id 
    const party = await Party.findOne({_id: id})
    //public party
     if(party.privacy === false){
       res.json({error: null, party: party})

     }else{
        //privacy party
        const token = req.header("auth-token")
        const user = await getUserByToken(token)
        const userId = user._id.toString()
        const partyUserId = party.userId.toString()

        //check is user id is qual to party user is
        if(userId == partyUserId){
            res.json({error: null, party: party})
        } /*else{
            return re.status(400).json({error: "Acesso Negado"})
        }*/
        
     }
    }
    catch(err){
        return res.status(400).json({error: "Este evento não existe"})
    }
})
// delete a party
router.delete("/", verifyToken, async (req, res) => {
    const token = req.header("auth-token")
    const user = await getUserByToken(token)
    const partyId = req.body.id
    const userId = user._id.toString()

    try{
        await Party.deleteOne({_id: partyId, userId: userId})
        res.json({error: null, msg: "Evento removido com sucesso"})
    }catch(err){
        res.status(400).json({error: "Acesso negado!"})

    }
})

// update a party
router.put('/', verifyToken, upload.fields([{name: "photos"}]), async (req, res)=>{
    const title = req.body.title
    const descrition = req.body.descrition
    const partyDate = req.body.partyDate
    const partyId = res.body.id
    const partyUserId = user.body.user_id
    const partyUserIdd = user._id.toString()

   let files = []

   if(req.files){
    files = req.files.photos
   }
   //validadores 
   if(title == "null" || descrition == "null" || partyDate ==  "null"){
    return res.status(400).json({error: "Preencha nome, descrição e data"})
   }
   //verify user
   const token = req.header("auth-token")
   const userByToken = await getUserByToken(token)
   const userId = userByToken._id.toSting()

   if(userId != partyUserId){
   return res.status(400).json({error: "Acesso negado!"})
    
   }

   // build party object
   const party = {
    id: partyId,
    title: title,
    descrition: descrition,
    partyDate: partyDate,
    privacy: req.body.privacy,
    userId: userId
   }

    // creat photo array with path
    let photos =  [ ]

    if(files && files.length > 0 ){
        files.forEach((photo, i ) => {
            photos[i] = photo.path
        })

        party.photos = photos
    }

    try{
        //raturns updade data
        const updateParty = await Party.findOneAndUpdate({_id: partyId, userId: userId},{$set: party}, {new: true})
        res.json({error: null, msg: "Evento atualizado com sucesso!", data: updateParty})
    }catch(error){
        res.status(400).json({error})
    }

})



 
module.exports = router

