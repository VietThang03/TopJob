import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UserDocument, User as UserS } from 'src/users/entities/user.schema';
import { Response } from 'express';
import ms from 'ms';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(UserS.name) private userModel: SoftDeleteModel<UserDocument>,
    private roleService: RolesService
  ) {}

   createRefreshToken(_id: string, name: string, email: string, role: string) {
    const payload = {
      sub: 'refresh token',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE'),
    });
    return refresh_token;
  }

  createAccessToken(_id: string, name: string, email: string, role: string) {
    const payload = {
      sub: 'access token',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };
    const access_token = this.jwtService.sign(payload);
    return access_token;
  }

  //ussername/ pass là 2 tham số thư viện passport nó ném về
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid === true) {
        const userRole = user.role as unknown as {_id: string; name: string}
        const temp = await this.roleService.findOne(userRole._id.toString())
        const objUser = {
          ...user.toObject(),
          permissions: temp?.result.permissions ?? []
        }
        return objUser

      }
    }

    return null;
  }

  async login(user: User, response: Response) {
    const { _id, name, email, role, permissions } = user;
    const refresh_token = this.createRefreshToken(_id, name, email, role._id);
    await this.userModel.updateOne(
      {
        _id: _id,
      },
      {
        refreshToken: refresh_token,
      },
    );
    // set refresh_token as cookies
    response.clearCookie('resfresh_token')
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      // maxAge: ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRE"))
      maxAge: 604800000,
    });

    return {
      // message: "Login successfully",
      access_token: this.createAccessToken(_id, name, email, role._id),
      user: {
        _id,
        name,
        email,
        role,
        permissions
      },
    };
  }

  async register(user: RegisterUserDto, response: Response) {
    let newUser = await this.usersService.register(user);
    const refresh_token = this.createRefreshToken(
      newUser._id.toString(),
      newUser.name,
      newUser.email,
      newUser.role.toString(),
    );
    await this.userModel.updateOne(
      {
        _id: newUser?._id,
      },
      {
        refreshToken: refresh_token,
      },
    );
    const result = await this.userModel
      .findOne({
        _id: newUser._id,
      })
      .select(['-password', '-refreshToken']);
    //fetch permission
    const temp = await this.roleService.findOne( newUser.role.toString()) 
    // set refresh_token as cookies
    response.clearCookie('resfresh_token')
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      // maxAge: ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRE"))
      maxAge: 604800000,
    });
    return {
      // _id: newUser?._id,
      // createAt: newUser?.createdAt,
      access_token: this.createAccessToken(
        newUser._id.toString(),
        newUser.name,
        newUser.email,
        newUser.role.toString(),
      ),
      user: {
        ...result,
        permissions: temp?.result.permissions ?? []
      },
    };
  }

  account(user: User) {
    // const { _id, email, name, role } = user;
    return {
      message: "Get account user successfully",
      user
    };
  }

  async createNewToken(refreshToken: string, response: Response) {
    try {
      // verify refresh token
      await this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      // find user
      const user = await this.userModel.findOne({
        refreshToken: refreshToken,
      }).populate({
        path: "role",
        select: {
          name: 1
        }
      });
      if (user) {
        const { _id, email, role, name } = user;
        const refresh_token = this.createRefreshToken(
          _id.toString(),
          email,
          role.toString(),
          name,
        );
        //fetch user role
        const userRole = user.role as unknown as {_id: string; name: string}
        const temp = await this.roleService.findOne(userRole._id)
        // set cookies
        response.clearCookie('resfresh_token')
        response.cookie('resfresh_token', refresh_token, {
          httpOnly: true,
          // maxAge: ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRE"))
          maxAge: 604800000,
        });
        // update new refreshToken
        await this.userModel.updateOne(
          { _id: _id },
          {
            refreshToken: refreshToken,
          },
        );
        return {
          message: "Create new token successfully",
          access_token: this.createAccessToken(
            _id.toString(),
            email,
            role.toString(),
            name,
          ),
          user: {
            _id,
            email,
            name,
            role,
            permissions: temp?.result.permissions ?? []
          },
        }
      }
    } catch (error) {
      throw new BadRequestException()
    }
  }

  async logout(user: User, response: Response){
    const { _id} = user;
    await this.userModel.updateOne(
      {_id},
      {
        refreshToken: ""
      }
    )
    response.clearCookie('refresh_token')
    return{
      message: "Logout successfully"
    }
  }
}
