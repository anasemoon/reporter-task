const mongoose=require('mongoose')
const validator=require('validator')
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')
const reporterScehma=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        validate(value){
            let emailReg = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,4}')
            if(!validator.isEmail(value) || !emailReg.test(value)){
                throw new Error ('Please enter valid email')

            }

        }

        
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:8,
        validate(value){
        let passwordReg = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])")
        if(!passwordReg.test(value)){
            throw new Error('Password must include uppercase,lowercase,special chracter and numbers')
        }
        }
    },
    phone:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        validate(value){
            let phoneReg=new RegExp("^(010|011|012|015)[0-9]{8}$")
            if(! phoneReg.test(value)){
                throw new Error('make sure the number is true ang an egyption number')
            }

        }
    },
    tokens:[
        {
            type:String,
            required:true
        }
    ],
    avatar:{
        type:Buffer
    }
    
})
reporterScehma.virtual('news',{
    ref:"News",
    localField:'_id',
    foreignField:'author'

})
reporterScehma.pre('save',async function(){
    const reporter=this
    if(reporter.isModified('password'))
    reporter.password=await bcryptjs.hash(reporter.password,8)
})
reporterScehma.statics.findByCredentials=async(email,password)=>{
    const reporter=await Reporter.findOne({email})
    if(!reporter){
        throw new Error('Unable to login please check email or password')
    }

const isMatch=await bcryptjs.compare(password,reporter.password)
if(!isMatch){
    throw new Error ('Unable to login please check email or password')
}
return reporter
}
reporterScehma.methods.generateToken=async function(){
    const reporter=this
    const token=jwt.sign({_id:reporter._id.toString()},'nodecourse')
    reporter.tokens=reporter.tokens.concat(token)
    await reporter.save()
    return token
}
reporterScehma.methods.toJSON=function(){
    const reporter=this
    const reporterObject=reporter.toObject()
delete reporterObject.password
delete reporterObject.tokens
return reporterObject
}
const Reporter=mongoose.model('Reporter',reporterScehma)
module.exports=Reporter