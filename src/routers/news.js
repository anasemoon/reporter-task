const express=require('express')
const router=express.Router()
const auth=require('../middelware/auth')
const News=require('../models/news')
const multer=require('multer')

//////////////////////////////////////////////////////////////////
//add news
router.post('/news',auth,async(req,res)=>{
    try{
        const news=new News({...req.body,author:req.reporter._id,autherName:req.reporter.name})
        console.log(news)
        await news.save()
        res.status(200).send(news)
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
/////////////////////////////////////////////////////////////////////////////
//return news for the current reporter
router.get('/news',auth,async(req,res)=>{
    try{
        await req.reporter.populate('news')
        res.send(req.reporter.news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
///////////////////////////////////////////////////////////
// return new with its id
router.get('/news/:id',auth,async(req,res)=>{
    try{
        const _id=req.params.id
        console.log(_id)
        console.log(req.reporter._id)
        const news=await News.findOne({_id,author:req.reporter._id})
        if(!news){
            return res.status(404).send('No New is founded')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
//////////////////////////////////////////////////////
// edit new with its id
router.patch('/news/:id',auth,async(req,res)=>{
    try{
        const _id=req.params.id
        console.log(_id)
        const updates=Object.keys(req.body)
        const news=await News.findOne({_id,author:req.reporter._id})
        if(!news){
            return res.status(404).send('No New')
        }
        updates.forEach((n)=>news[n]=req.body[n])
        await news.save()
        res.send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
/////////////////////////////////////////////////////////
//delete new with its id
router.delete('/news/:id',auth,async(req,res)=>{
    try{
        const _id=req.params.id
        const news=await News.findOneAndDelete({_id,author:req.reporter._id})
        if(!news){
            return res.status(404).send('No New is founded')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
//////////////////////////////////////////////////////////////////////
//return reporterdata for a new 
router.get('/reporterData/:id',auth,async(req,res)=>{
    try{
        await req.reporter.populate('news')
        res.send(req.reporter)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
/////////////////////////////////////////////////////////////////////////////////////////////
//upload picture
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
/////////////////////////////////////////////////////////////////////////////////
// add image to the new
router.post('/news/image/:id',auth,uploads.single('avatar'),async(req,res)=>{
    try{
        const _id=req.params.id
        console.log(_id)
        const news=await News.findOne({_id,author:req.reporter._id})
        if(!news){
            return res.status(404).send('No New')
        }
        news.avatar = req.file.buffer
        await news.save()
        res.send("image is added",news)
    }
    catch(e){
        res.status(500).send(e.message)
    }



//     try{
//         // News.avatar = req.file.buffer
//         // console.log('hiiiiiiiiiii')
//         // console.log(News.avatar)
//         const news=
//         console.log('news',news)
//         await news.save()
//         res.send()
//     }
//     catch(e){
//         res.status(400).send(e.message)
//     }
})

module.exports = router