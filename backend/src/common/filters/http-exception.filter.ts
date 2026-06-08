import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    response.status(status).json({
      code: status,
      message: typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : exceptionResponse.message || exception.message || '请求失败',
      data: null,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
