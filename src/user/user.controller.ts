import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SignUpDto } from './dtos/SignUp.dto';
import { TokenResponseDto } from './dtos/token-response.dto';
import {
  RefreshSwagger,
  SignInSwagger,
  SignUpSwagger,
} from '../common/decorators/swagger/auth-swagger.decorator';
import { SignInDto } from './dtos/sign-in.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Public } from '../common/decorators/public.decorator';
import { GetCurrentUserId } from '../common/decorators/get-user-id.decorator';
import { GetCurrentUser } from '../common/decorators/get-user.decorator';
import { UploadImageResponseDto } from './dtos/uploadImage-response.dto';
import { UploadSwagger } from '../common/decorators/swagger/upload-swagger.decorator';
import { ProfileDto } from './dtos/user.dto';
import { GetUserSwagger } from '../common/decorators/swagger/user-swagger.decorator';
import { diskStorage } from 'multer';
import { UploadService } from '../common/upload/upload.service';
import { Response } from 'express';
import { ImageFileValidationPipe } from '../common/pipes/file-validation.pip';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  @SignUpSwagger()
  @Public()
  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto): Promise<TokenResponseDto> {
    return await this.userService.signUp(dto);
  }

  @SignInSwagger()
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('sign-in')
  signIn(@Body() dto: SignInDto): Promise<TokenResponseDto> {
    return this.userService.signIn(dto);
  }

  @RefreshSwagger()
  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshToken(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser() user: any,
  ): Promise<TokenResponseDto> {
    return await this.userService.refreshTheToken(userId, user.refreshToken);
  }

  @UploadSwagger()
  @Patch('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: './uploads' }),
    }),
  )
  async uploadProfileImage(
    @UploadedFile(ImageFileValidationPipe)
    file: Express.Multer.File,
    @GetCurrentUserId() userId: number,
  ): Promise<UploadImageResponseDto> {
    return await this.userService.addProfileImage(file, userId);
  }

  @GetUserSwagger()
  @Get()
  async find(@GetCurrentUserId() userId: number): Promise<ProfileDto> {
    return await this.userService.find(userId);
  }

  @Get('download/:fileName')
  @Public()
  async downloadFile(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    return await this.uploadService.downloadFile(fileName, res);
  }
}
