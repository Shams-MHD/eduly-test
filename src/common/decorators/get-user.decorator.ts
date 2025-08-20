import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext): any => {
    const request = context.switchToHttp().getRequest<any>();
    if (!data) {
      return request.user;
    }
    return request.user;
  },
);
