import {Request, Response, NextFunction, RequestHandler} from 'express';
import ErrorHandler from './errorHandler';

export const TryCatch = (controller : (req : Request, res : Response, next : NextFunction) => Promise<any>) : RequestHandler => async(req, res , next) =>  {
  try {
    await controller(req, res, next)
  } catch (error : any) {
    console.error("[TryCatch Error]", error?.message, error?.stack);
    if(error instanceof ErrorHandler){
      return res.status(error.statusCode).json({
        message: error.message
      })
    }
    res.status(500).json({
      message : error.message
    })
  }
}