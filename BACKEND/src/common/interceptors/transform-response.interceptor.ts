import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { buildSuccess } from '../dto/api-response.dto';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                if (data && typeof data === 'object' && 'error' in data && 'message' in data && 'data' in data) {
                    return { ...(data as Record<string, unknown>) };
                }
                return buildSuccess(data);
            })
        );
    }
}