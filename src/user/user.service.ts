import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dtos/SignUp.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../../generated/prisma';
import { ConfigService } from '@nestjs/config';
import {
  DAY,
  WEEK,
  WEEK_IN_MILLISECONDS,
} from '../common/constants/dates.constants';
import { TokenResponseDto } from './dtos/token-response.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { UploadService } from '../common/upload/upload.service';
import { ProfileDto } from './dtos/user.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly uploadService: UploadService,
  ) {}

  async find(id: number): Promise<ProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        imageUrl: true,
        name: true,
        createdAt: true,
      },
    });
    return user;
  }

  async addProfileImage(file: Express.Multer.File, id: number) {
    const { file_name, signedUrl } = await this.uploadService.uploadFile(file);
    await this.prisma.user.update({
      where: { id },
      data: { imageUrl: signedUrl },
    });

    return {
      uploadUrl: signedUrl,
      fileName: file_name,
    };
  }

  async signUp(dto: SignUpDto): Promise<TokenResponseDto> {
    const userExist = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (userExist) {
      throw new HttpException('email already exists', HttpStatus.CONFLICT);
    }

    const { password, ...restOfDto } = dto;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await this.prisma.user.create({
      data: { ...restOfDto, password: hashedPassword, role: Role.USER },
    });
    const tokens = await this.generateTokens(user.id, user.role);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: this.getDateAfterSevenDays(),
      },
    });
    return tokens;
  }

  async signIn(dto: SignInDto): Promise<TokenResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new ForbiddenException();
    }
    if (!bcrypt.compareSync(dto.password, user.password)) {
      throw new ForbiddenException();
    }
    const tokens = await this.generateTokens(user.id, user.role);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: this.getDateAfterSevenDays(),
      },
    });
    return tokens;
  }

  async refreshTheToken(
    id: number,
    refreshToken: string,
  ): Promise<TokenResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        refreshTokens: {
          select: {
            token: true,
          },
        },
      },
    });
    if (!user) {
      throw new ForbiddenException();
    }
    const validRefreshTokens = user.refreshTokens.some(
      (token) => token.token === refreshToken,
    );
    if (!validRefreshTokens) {
      throw new ForbiddenException();
    }
    const tokens = await this.generateTokens(user.id, user.role);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: this.getDateAfterSevenDays(),
      },
    });
    return tokens;
  }

  private async generateTokens(
    userId: number,
    role: Role,
  ): Promise<TokenResponseDto> {
    const accessToken = await this.jwtService.signAsync(
      {
        id: userId,
        role,
      },
      {
        secret: `${this.configService.get('AT_SECRET')}`,
        expiresIn: DAY,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        id: userId,
        role,
      },
      {
        secret: `${this.configService.get('RT_SECRET')}`,
        expiresIn: WEEK,
      },
    );

    return { accessToken, refreshToken };
  }

  private getDateAfterSevenDays(): Date {
    return new Date(Date.now() + WEEK_IN_MILLISECONDS);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
  }
}
