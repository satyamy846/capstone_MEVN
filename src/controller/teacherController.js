import CustomError from "../utils/errorHandler.js";
import {teachermodel} from '../models/Teacher.js';
import { quizmodel } from "../models/dashboard/quiz.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const SECRET_KEY = "NOTESAPI";


export const teacherController={

    async signup (req,res,next){
        //extracting the details of teacher
        const {firstname,lastname,email,password,contact} = req.body;
        try{ 
                //checking existing user
                const existinguser = await teachermodel.findOne({email:email});
                if(existinguser){
                    return res.status(400).json({message:"User is already exists"})
                }
                //Now hashed the password (Encrypt it)
                const hashedpassword = await bcrypt.hash(password,10);  //hash takes two argument one what we want to hash and another is how many times our hashing code will run
    
                //create the user in database
                const result = await teachermodel.create({
                    firstname:firstname,
                    lastname:lastname,
                    email:email,
                    password:hashedpassword,
                    contact:contact
                });
                
                //generate the token
                const token = await jwt.sign({email: result.email ,id: req._id},SECRET_KEY)  //sign(payload,secretkey) payload-> used to store that if it is a valid user or not| secretkey
                res.status(201).json({user:result,token:token})
            
        }
        catch(err){
            next(new CustomError(err.message,500,"Unable to Create"));
        }
    },
    async login(req,res,next){
        //extracting teacher email or password while signing in
        const {email, password} = req.body;
        try{
            const existinguser = await teachermodel.find({email:email});
            if(!existinguser){
                return res.status(404).json({message:"User Not Found"});
            }
            //check the password
            const matchingpassword= await bcrypt.compare(password,existinguser.password);
            if(!matchingpassword){
                return res.status(400).json({message:"Invalid Credential"})
            }
            //password matched then generate the token
            const token = await jwt.sign({email:existinguser.email,id:existinguser._id},SECRET_KEY);
            res.status(200).json({
                teacher:existinguser,
                token
            })

        }
        catch(err){
            next(new CustomError(err.message,500,"Unable to fetch"))
        }
    },

    async createQuiz(req,res,next){
        try{
            currowner:req.userid
            currentEmail:req.email
            var quiz = new quizmodel({
                quizname: req.body.quizname,
                quizdescription:req.body.quizdescription,
                upload: req.body.upload,
                owner: currowner,
                owneremail: currentEmail
            })

            quiz.save((error,qz)=>{
                if(error){
                    console.log(error);
                    req.json({msg : "failed to create"})
                }
                else{
                    res.status(200).json("Quiz has been added");
                }
            })

        }
        catch(err){
            next(new CustomError(err.message(500,"Unable to create quiz retry!")))
        }
    },

    async getUplodedquiz(req,res,next){
        try{
            quizmodel.find({owner:req.userid,upload:false},(err,qz)=>{
                if(err){
                    console.log(err);
                }
                else{
                    res.status(200).json({quiz:qz})
                }
            })
        }
        catch(err){

        }
    }
    
}