export interface Tag {
  id: string
  name: string
  color: string
  icon: string
}

export interface Task {
  id: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
  estimatedTime?: number
  dueDate?: string | Date
  recurrence?: string
  tags?: Tag[]
  createdAt: string | Date
  updatedAt: string | Date
}

export interface User {
  id: string
  email: string
  nickname?: string
  avatarUrl?: string
}

export interface Credentials {
  email: string
  password: string
  nickname?: string
}
