import type { TagModel } from './model'
import { TagRepository } from './repositories/tag.repository'

export abstract class TagService {
  static async create(userId: string, data: TagModel['createTagBody']) {
    return await TagRepository.create(userId, data)
  }

  static async findAll(userId: string) {
    return await TagRepository.findAll(userId)
  }

  static async findById(userId: string, tagId: string) {
    return await TagRepository.findById(userId, tagId)
  }

  static async update(userId: string, tagId: string, data: TagModel['updateTagBody']) {
    return await TagRepository.update(userId, tagId, data)
  }

  static async delete(userId: string, tagId: string) {
    return await TagRepository.delete(userId, tagId)
  }
}
