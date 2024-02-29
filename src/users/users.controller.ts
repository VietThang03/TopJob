import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/decorator/customize';
import { User as UserType } from './user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @User() user: UserType) {
    let newUser = await this.usersService.create(createUserDto, user);
    return {
      message: "Create user successfully!!!",
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }
  }

  @Get()
  findAll(@Query("current") page: string, @Query("pageSize") limit: string, @Query() qs: string) {
    return this.usersService.findAll(+page, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('/:id')
  async update(@Param('id') id: string,@Body() updateUserDto: UpdateUserDto, @User() user: UserType) {
    let updateUser = await this.usersService.update(updateUserDto, user, id);
    return {
      message: "Update user successfully",
      updateUser
    }
  }

  @Delete('/:id')
  remove(@Param('id') id: string, @User() user: UserType) {
    return this.usersService.remove(id, user);
  }
}
