const express=require('express')
const router=express.Router()
const Reporter=require('../models/reporter')
const auth=require('../middelware/auth')
const multer=require('multer')

////////////////////////////////////////////////////////////
//register as new reporter
router.post('/signup',async(req,res)=>{
    try{
        const reporter=new Reporter(req.body)
        const token=await reporter.generateToken()
        await reporter.save()
        res.status(200).send({reporter,token})
    }
    catch(e){
        res.status(400).send(e)
    }
})

/////////////////////////////////////////////////////////////////////
//login to exist account
router.post('/login',async(req,res)=>{
    try{
        const reporter=await Reporter.findByCredentials(req.body.email,req.body.password)
        const token=await reporter.generateToken()
        res.send({reporter,token})
    }
    catch(e){
        res.send(e.message)
    }
})
///////////////////////////////////////////////////////////////////
// return the profile for current reporter
router.get('/profile',auth,async(req,res)=>{
    try{
        res.send(req.reporter)
    }
    catch(e){
        res.status(500).send(e.message)
    }
    
})
/////////////////////////////////////////////////////////////////////////////
// logout from current token
router.delete('/logout',auth,async(req,res)=>{
    try{
        req.reporter.tokens = req.reporter.tokens.filter((el)=>{
            return el !== req.token
        })
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
/////////////////////////////////////////////////////////////////////
//logout from all reporter accounts
router.delete('/logoutAll',auth,async(req,res)=>{
    try{
        req.reporter.tokens = req.reporter.tokens.filter((el)=>{
            return el == []
        })
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
///////////////////////////////////////////////////////////////////
// return all reporters
router.get('/reporters',auth,(req,res)=>{
    Reporter.find({}).then((reporters)=>{
        res.status(200).send(reporters)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

//////////////////////////////////////////////////////////////////////////
//returns the curent reporter datails
router.get('/reporter',auth,(req,res)=>{
    // console.log(req.reporter)
     const id = req.reporter._id
     if(!id){
        return res.status(404).send('Unable to find reporter')
     }
     res.status(200).send(req.reporter)

 })
 
 ///////////////////////////////////////////////////////////////////////////
//  update current reporter
 router.patch('/reporter',auth,async(req,res)=>{
    try{
        const updates = Object.keys(req.body)
        console.log(updates)
       const reporterId = req.reporter._id
       console.log('id=',reporterId)
        if(!reporterId){
            return res.status(404).send('No reporter is found')
        }
         updates.forEach((el)=> reporterId[el]=req.body[el])
         await reporterId.save()
        res.status(200).send(reporterId)
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
//////////////////////////////////////////////////////////////////////////////////
// delete current reporter
router.delete('/reporter',auth,async(req,res)=>{
    try{
        const reporter = await Reporter.deleteOne(req.reporter._id)
        if(!reporter){
            return res.status(404).send('Not found')
        }
        res.status(200).send(reporter)
    }
    catch(e){
        res.status(500).send(e.message)
    }
     
})
//////////////////////////////////////////////////////////////
// return reporter news
router.get('/myNews',auth,async(req,res)=>{
    try{
        await req.reporter.populate('news')
        res.send(req.reporter.news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
/////////////////////////////////////////////////////////////////////////
// upload image
const uploads = multer({
    limits:{
        fileSize:1000000  
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|jfif|png)$/)){
            cb(new Error('Please upload image'))
        }
        cb(null,true)
    }
})
//////////////////////////////////////////////////////////////////////
// put picture for the reporter
router.post('/profile/avatar',auth,uploads.single('avatar'),async(req,res)=>{
    try{
        req.reporter.avatar = req.file.buffer
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

module.exports = router


