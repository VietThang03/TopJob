import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Public } from 'src/decorator/customize';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/entities/subscriber.entity';
import { Job, JobDocument } from 'src/jobs/entities/job.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private subcriberModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>
  ) {}

  @Get()
  @Public()
  @Cron("0 0 7 * * 0")//7h ngay chu nhat
  async handleTestEmail() {
    const subcribers = await this.subcriberModel.find({})
    for(const subs of subcribers){
      const subSkills = subs.skills
      const jobWithMatchingSkills = await this.jobModel.find({
        skills: {
          $in: subSkills
        }
      })
      if(jobWithMatchingSkills?.length){
        const jobs = jobWithMatchingSkills.map(item => {
          return {
            name: item.name,
            company: item.company,
            salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " vnđ",
            skills: item.skills
          }
        })
        await this.mailerService.sendMail({
          to: subs.email,
          from: '"Support Team" <thangdevilboss2010@gmail.com>', // override default from
          subject: 'Welcome to Nice App! Confirm your Email',
          template: "new-job",
          context:{
            receiver: subs.name,
            jobs: jobs
          }
        });
      }
    }
    return{
      message: "Send email successfully"
    }
  }
}
