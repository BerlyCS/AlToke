export class SystemMetrics {
  totalUsers: number
  activeUsersDaily: number
  tasksCompletedToday: number
  retentionRate: number

  constructor(
    totalUsers: number,
    activeUsersDaily: number,
    tasksCompletedToday: number,
    retentionRate: number,
  ) {
    this.totalUsers = totalUsers
    this.activeUsersDaily = activeUsersDaily
    this.tasksCompletedToday = tasksCompletedToday
    this.retentionRate = retentionRate
  }
}
