import { Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

interface EmailJob {
  organizationId: string;
  leadId: string;
  title: string;
  to: string;
}

@Processor('emails')
@Injectable()
export class EmailProcessor {
  @Process('lead-created')
  async handleLeadCreated(job: Job<EmailJob>) {
    console.log(`Processing email job for lead: ${job.data.leadId}`, job.data);

    try {
      // TODO: Implement actual email sending via EmailService
      // For now, just log and mark as completed
      console.log(`Email would be sent to: ${job.data.to}`);

      await job.progress(100);
      return { success: true, leadId: job.data.leadId };
    } catch (error) {
      console.error('Email job failed:', error);
      throw error;
    }
  }
}
