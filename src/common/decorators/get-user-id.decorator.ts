import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserId = createParamDecorator(
  (_data: string | undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<any>();
    return request.user?.id;
  },
);
