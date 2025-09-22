import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CompanySettingsService } from './company-settings.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private companySettingsService: CompanySettingsService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.authService.validateUser(req.user.sub);
    return {
      user,
      blockedMenus: user?.blockedMenus || [],
    };
  }

  @Get('blocked-menus')
  @UseGuards(JwtAuthGuard)
  async getBlockedMenus(@Request() req) {
    const user = await this.authService.validateUser(req.user.sub);
    return {
      blockedMenus: user?.blockedMenus || [],
    };
  }
}
