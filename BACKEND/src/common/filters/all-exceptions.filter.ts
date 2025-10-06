import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { buildError } from '../dto/api-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: { status: (code: number) => { json: (body: unknown) => void } } = ctx.getResponse();
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') message = res;
            else if (typeof res === 'object' && res !== null && 'message' in res) {
                const msg = (res as { message?: unknown }).message;
                if (typeof msg === 'string') message = msg;
            }
        } else if (exception && typeof exception === 'object' && 'message' in exception) {
            const exMsg = (exception as { message?: unknown }).message;
            if (typeof exMsg === 'string') message = exMsg;
        }

        response.status(status).json(buildError(message));
    }
}