import { Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

interface NotificationJob {
  organizationId: string;
  leadId: string;
  title: string;
}

@Processor('notifications')
@Injectable()
export class NotificationProcessor {
  @Process('lead-created')
  async handleLeadCreated(job: Job<NotificationJob>) {
    console.log(
      `Processing notification job for lead: ${job.data.leadId}`,
      job.data,
    );

    try {
      // TODO: Implement persistence to database if needed
      // For now, notifications are handled via WebSocket gateway in real-time
      console.log(
        `Notification event: lead created in org ${job.data.organizationId}`,
      );

      await job.progress(100);
      return { success: true, leadId: job.data.leadId };
    } catch (error) {
      console.error('Notification job failed:', error);
      throw error;
    }
  }
}
