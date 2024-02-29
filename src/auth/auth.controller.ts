import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { User as UserType } from 'src/users/user.interface';
import { request } from 'http';
import { RolesService } from 'src/roles/roles.service';

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RolesService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async handleLogin(@Req() req, @Res({passthrough: true}) response: Response) {
    return await this.authService.login(req.user, response);
  }

  @Public()
  @Post('/register')
  async handleRegister(@Body() regiserUserDto: RegisterUserDto, @Res({passthrough: true}) response: Response){
    let registerUser = await this.authService.register(regiserUserDto, response)
    return {
      message: 'Register successfully!!!',
      registerUser
    }
  }

  @Get('/account')
  async getAccount(@User() user: UserType){
    const temp = await this.roleService.findOne(user.role as any) as any;
    // console.log(temp)
    user.permissions = temp?.result.permissions ?? []
    return {
      user
    }
  }

  @Get('refresh')
  async processNewToken(@Res({passthrough: true}) response: Response, @Req() request: Request){
    const refreshToken = request.cookies['refresh_token']
    return await this.authService.createNewToken(refreshToken, response)
  }

  @Post('/logout')
  async handleLogout(@User() user: UserType, @Res({passthrough: true}) response: Response){
    return await this.authService.logout(user, response)
  }
}
