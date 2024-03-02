import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { User as UserType } from 'src/users/user.interface';
import { Public, User } from 'src/decorator/customize';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  createJob(@Body() createJobDto: CreateJobDto, @User() user: UserType) {
    return this.jobsService.create(createJobDto, user);
  }

  @Get()
  @Public()
  findAllJob(@Query("current") page: string, @Query("pageSize") limit: string, @Query() qs: string) {
    return this.jobsService.findAll(+page, +limit, qs);
  }

  @Get(':id')
  @Public()
  findOneJob(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  updateJob(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @User() user: UserType) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  removeJob(@Param('id') id: string, @User() user: UserType) {
    return this.jobsService.remove(id, user);
  }
}
