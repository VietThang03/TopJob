import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { User } from 'src/decorator/customize';
import { User as UserType } from 'src/users/user.interface';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  create(@Body() createResumeDto: CreateResumeDto, @User() user: UserType) {
    return this.resumesService.create(createResumeDto, user);
  }

  @Get()
  findAll(@Query("current") page: string, @Query("pageSize") limit: string, @Query() qs: string) {
    return this.resumesService.findAll(+page, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Get('/by-user')
  findByUser(@User() user: UserType){
    return this.resumesService.findUser(user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body("status") status: string, @User() user: UserType) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: UserType) {
    return this.resumesService.remove(id, user);
  }
}
