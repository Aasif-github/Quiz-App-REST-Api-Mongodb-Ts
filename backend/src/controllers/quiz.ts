//model
import { RequestHandler } from "express";
import * as redis from "redis";

import ProjectError from "../helper/error";
import Quiz from "../models/quiz";
import { ReturnResponse } from "../utils/interfaces";

const _createRedisClient = async () => {
  
  const client = await redis.createClient();
  
  client.on('error', (err) => {
      console.error('Redis connection error:', err);
  });
  // Additional initialization or setup logic can go here
  return client;
}



const createQuiz: RequestHandler = async (req, res, next) => {
  try {
    const createdBy = req.userId;
    const name = req.body.name;
    const category = req.body.category;
    const difficultyLevel = req.body.difficultyLevel;
    const questionList = req.body.questionList;
    const answers = req.body.answers;
    const passingPercentage = req.body.passingPercentage;
    const attemptsAllowedPerUser = req.body.attemptsAllowedPerUser;
    const isPublicQuiz = req.body.isPublicQuiz;
    const allowedUser = req.body.allowedUser;
    const quiz = new Quiz({ name, category, difficultyLevel, questionList, answers, passingPercentage, createdBy, attemptsAllowedPerUser, isPublicQuiz, allowedUser });
    const result = await quiz.save();
    console.log('quiz created..');
    
    const resp: ReturnResponse = {
      status: "success",
      message: "Quiz created successfully",
      data: { quizId: result._id },
    };
    res.status(201).send(resp);
  } catch (error) {
    next(error);
  }
};

const getQuiz: RequestHandler = async (req, res, next) => {
  try {
      // //set-up redis
      // const client = redis.createClient(); 
      // await client.connect();

    const quizId = req.params.quizId;
    
    let quiz;
    
    if (quizId) {
      quiz = await Quiz.findById(quizId, {
        name: 1,
        category: 1,
        questionList: 1,
        answers: 1,
        createdBy: 1,
        passingPercentage: 1,
        isPublicQuiz: 1,
        allowedUser: 1
      });

      // console.log('getQuiz for Quiz-id:', quiz); //single
      
      if (!quiz) {
        const err = new ProjectError("No quiz found!");
        err.statusCode = 404;
        throw err;
      }

      if(!quiz.isPublicQuiz && !quiz.allowedUser.includes(req.userId)){
        const err = new ProjectError("You are not authorized!");
        err.statusCode = 403;
        throw err;
      }
      if (req.userId !== quiz.createdBy.toString()) {
        const err = new ProjectError("You are not authorized!");
        err.statusCode = 403;
        throw err;
      }
    } else {

      const redisClient = await _createRedisClient();
      
      await redisClient.connect();
      if(redisClient.isOpen){ 
        //your code
        console.log('connection is open');   
      }else{
        console.log('connection is close');   
      }
      
      let redis_flag = await redisClient.get('redis_flag');

      console.log('redis_flag', redis_flag);
      
      let quiz_redis_cache = await redisClient.get(JSON.stringify(req.userId));
      console.log(quiz_redis_cache);
      
      if(quiz_redis_cache){
        console.log('CACHE');        
      }else{
        console.log('DB');
      }
      //for first time
      console.log('SERVING FROM REDIS');

       
      

      console.log("from redis", quiz_redis_cache);      
      console.log('redis_flag',redis_flag);
    
      if(redis_flag==null){
         if(!quiz_redis_cache){          
            console.log('SERVING FROM MONGODB');
            quiz = await Quiz.find({ createdBy: req.userId });
        
          //set redis-flag to 0 so that it will send again 1
          await redisClient.set('redis_flag', 'not'); 
        // Set data in Redis cache
        await redisClient.set(JSON.stringify(req.userId), JSON.stringify(quiz));      
  
        console.log('getQuiz-all:', quiz);  
     
      }else{
         quiz = JSON.parse(quiz_redis_cache); //DEL "\"660659e5960ccf27e7522920\""
      }       
    }else{
     // quiz = JSON.parse(quiz_redis_cache); //DEL "\"660659e5960ccf27e7522920\""
    }   
  }
    if (!quiz) {
      const err = new ProjectError("Quiz not found!");
      err.statusCode = 404;
      throw err;
    }

    const resp: ReturnResponse = {
      status: "success",
      message: "Quiz",
      data: quiz,
    };
    res.status(200).send(resp);
  } catch (error) {
    next(error);
  }
};

const updateQuiz: RequestHandler = async (req, res, next) => {
  try {
    const quizId = req.body._id;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      const err = new ProjectError("Quiz not found!");
      err.statusCode = 404;
      throw err;
    }

    if (req.userId !== quiz.createdBy.toString()) {
      const err = new ProjectError("You are not authorized!");
      err.statusCode = 403;
      throw err;
    }

    if (quiz.isPublished) {
      const err = new ProjectError("You cannot update, published Quiz!");
      err.statusCode = 405;
      throw err;
    }
    if (quiz.name != req.body.name) {
      let status = await isValidQuizName(req.body.name);
      if (!status) {
        const err = new ProjectError("Please enter an unique quiz name.");
        err.statusCode = 422;
        throw err;
      }
      quiz.name = req.body.name;
    }
    quiz.questionList = req.body.questionList;
    quiz.answers = req.body.answers;
    quiz.passingPercentage = req.body.passingPercentage;
    quiz.isPublicQuiz = req.body.isPublicQuiz;
    quiz.allowedUser = req.body.allowedUser;

    await quiz.save();

    const resp: ReturnResponse = {
      status: "success",
      message: "Quiz updated successfully",
      data: {},
    };
    res.status(200).send(resp);
  } catch (error) {
    next(error);
  }
};

const deleteQuiz: RequestHandler = async (req, res, next) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      const err = new ProjectError("Quiz not found!");
      err.statusCode = 404;
      throw err;
    }

    if (req.userId !== quiz.createdBy.toString()) {
      const err = new ProjectError("You are not authorized!");
      err.statusCode = 403;
      throw err;
    }

    if (quiz.isPublished) {
      const err = new ProjectError("You cannot delete, published Quiz!");
      err.statusCode = 405;
      throw err;
    }

    await Quiz.deleteOne({ _id: quizId });
    const resp: ReturnResponse = {
      status: "success",
      message: "Quiz deleted successfully",
      data: {},
    };
    res.status(200).send(resp);
  } catch (error) {
    next(error);
  }
};

const publishQuiz: RequestHandler = async (req, res, next) => {
  try {
    const quizId = req.body.quizId;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      const err = new ProjectError("Quiz not found!");
      err.statusCode = 404;
      throw err;
    }

    if (req.userId !== quiz.createdBy.toString()) {
      const err = new ProjectError("You are not authorized!");
      err.statusCode = 403;
      throw err;
    }

    if (!!quiz.isPublished) {
      const err = new ProjectError("Quiz is already published!");
      err.statusCode = 405;
      throw err;
    }
    if(quiz.isPublicQuiz === false && quiz.allowedUser.length === 0){
      const err = new ProjectError("Specify users for private quiz!");
          err.statusCode = 404;
          throw err;
  }

    quiz.isPublished = true;
    await quiz.save();
    const resp: ReturnResponse = {
      status: "success",
      message: "Quiz published!",
      data: {},
    };
    res.status(200).send(resp);
  } catch (error) {
    next(error);
  }
};

const isValidQuiz = async (
  questionList: [{ questionNumber: Number; question: String; options: {} }],
  answers: {}
) => {
  if (!questionList.length) {
    return false;
  }
  if (questionList.length != Object.keys(answers).length) {
    return false;
  }
  let flag = true;
  questionList.forEach(
    (question: { questionNumber: Number; question: String; options: {} }) => {
      let opt = Object.keys(question["options"]);
      if (
        opt.indexOf(
          `${Object.values(answers)[
          Object.keys(answers).indexOf(question.questionNumber.toString())
          ]
          }`
        ) == -1
      ) {
        flag = false;
      }
    }
  );
  return flag;
};

const isValidQuizName = async (name: String) => {
  const quiz = await Quiz.findOne({ name });
  if (!quiz) {
    return true;
  }
  return false;
};

const getAllQuiz: RequestHandler = async (req, res, next) => {
  try {
    let quiz = await Quiz.find({ isPublished: true }, {
      name: 1,
      category: 1,
      questionList: 1,
      createdBy: 1,
      passingPercentage: 1,
      isPublicQuiz:1,
      allowedUser:1
    });
    
    //filter quizzes created by user itself
    quiz = quiz.filter(item => {
      if(item.isPublicQuiz || item.allowedUser.includes(req.userId)){
          return item.createdBy.toString() !== req.userId;
      }
      
    });
    
    if (!quiz) {
      const err = new ProjectError("No quiz found!");
      err.statusCode = 404;
      throw err;
    }
    
    const resp: ReturnResponse = {
      status: "success",
      message: "All Published Quiz",
      data: quiz,
    };
    res.status(200).send(resp);

  } catch (error) {
    next(error);
  }
};

const getAllQuizExam: RequestHandler = async (req, res, next) => {
  try {
    let quiz = await Quiz.find({ isPublished: true, category: "exam" },
    {
      name: 1,
      category: 1,
      questionList: 1,
      createdBy: 1,
      passingPercentage: 1,
      isPublicQuiz: 1,
      allowedUser: 1,
    });

    quiz = quiz.filter((item) => {
      if (item.isPublicQuiz || item.allowedUser.includes(req.userId)) {
        return item.createdBy.toString() !== req.userId;
      }
    });

    if (!quiz) {
      const err = new ProjectError("No exam quiz found!");
      err.statusCode = 404;
      throw err;
    }

    const resp: ReturnResponse = {
      status: "success",
      message: "All Exam Quizzes",
      data: quiz,
    };
    res.status(200).send(resp);
  } catch (error) {
    next(error);
  }
};

const getAllQuizTest: RequestHandler = async (req, res, next) => {
  try {
    let quiz = await Quiz.find({ isPublished: true, category: "test" },
    {
      name: 1,
      category: 1,
      questionList: 1,
      createdBy: 1,
      passingPercentage: 1,
      isPublicQuiz: 1,
      allowedUser: 1,
    });

    quiz = quiz.filter((item) => {
      if (item.isPublicQuiz || item.allowedUser.includes(req.userId)) {
        return item.createdBy.toString() !== req.userId;
      }
    });

    if (!quiz) {
      const err = new ProjectError("No test quiz found!");
      err.statusCode = 404;
      throw err;
    }
    // qtxe hejs gjtg spul

    const resp: ReturnResponse = {
      status: "success",
      message: "All Test Quizzes",
      data: quiz,
    };
    res.status(200).send(resp);
  } catch (error) {
    next(error);
  }
};

export {
  createQuiz,
  deleteQuiz,
  getQuiz,
  isValidQuiz,
  isValidQuizName,
  publishQuiz,
  updateQuiz,
  getAllQuiz,
  getAllQuizExam,
  getAllQuizTest
};
