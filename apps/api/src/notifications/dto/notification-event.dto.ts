export class NotificationEventDto {
  type: string;
  organizationId: string;
  data: Record<string, any>;
  timestamp: Date;

  constructor(
    type: string,
    organizationId: string,
    data: Record<string, any> = {},
  ) {
    this.type = type;
    this.organizationId = organizationId;
    this.data = data;
    this.timestamp = new Date();
  }
}
