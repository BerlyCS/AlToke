export class AuditLog {
  id: string;
  adminId: string;
  targetId: string;
  action: string;
  timestamp: Date;

  constructor(
    id: string,
    adminId: string,
    targetId: string,
    action: string,
    timestamp: Date
  ) {
    this.id = id;
    this.adminId = adminId;
    this.targetId = targetId;
    this.action = action;
    this.timestamp = timestamp;
  }
}