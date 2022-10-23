//const { diskStorage } = require('multer')
const multer = require('multer')
const path = require('path')

const diskStorage = multer.diskStorage({
    dstination: (req, file , cb ) =>{
        cd(null, 'public/img')
    },
    
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})  

module.exports = diskStorage    