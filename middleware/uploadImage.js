import multer from "multer";
import path from 'path'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        cb(null, 'foodImages/')
    },

    filename: (req, file, cb) => {

        const fileName = file.originalname.split('.')[0]
        
        const imageName = Date.now() + ' ' + fileName + path.extname(file.originalname)
     
        cb(null, imageName)
    }
})

const uploadFoodImage = multer({ storage })

export default uploadFoodImage

