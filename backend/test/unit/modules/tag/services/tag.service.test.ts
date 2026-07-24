import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { TagService } from '../../../../../src/modules/tag/service'
import { TagRepository } from '../../../../../src/modules/tag/repositories/tag.repository'

const makeTag = (overrides: any = {}) => ({
  id: 'tag-1',
  userId: 'user-1',
  name: 'Test Tag',
  color: '#FFFFFF',
  icon: 'star',
  ...overrides,
})

describe('TagService', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('create', () => {
    it('creates a tag successfully', async () => {
      const tag = makeTag()
      spyOn(TagRepository, 'create').mockResolvedValue(tag as any)

      const result = await TagService.create('user-1', {
        name: 'Test Tag',
        color: '#FFFFFF',
        icon: 'star',
      })

      expect(result).toEqual(tag)
    })
  })

  describe('findAll', () => {
    it('returns all tags for a user', async () => {
      const tags = [makeTag(), makeTag({ id: 'tag-2', name: 'Tag 2' })]
      spyOn(TagRepository, 'findAll').mockResolvedValue(tags as any)

      const result = await TagService.findAll('user-1')
      expect(result.length).toBe(2)
      expect(result[1].name).toBe('Tag 2')
    })
  })

  describe('findById', () => {
    it('returns a tag by id', async () => {
      const tag = makeTag()
      spyOn(TagRepository, 'findById').mockResolvedValue(tag as any)

      const result = await TagService.findById('user-1', 'tag-1')
      expect(result).toEqual(tag)
    })

    it('returns null if not found', async () => {
      spyOn(TagRepository, 'findById').mockResolvedValue(null as any)
      const result = await TagService.findById('user-1', 'nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('updates a tag successfully', async () => {
      const tag = makeTag({ name: 'Updated' })
      spyOn(TagRepository, 'update').mockResolvedValue(tag as any)

      const result = await TagService.update('user-1', 'tag-1', { name: 'Updated' })
      expect(result?.name).toBe('Updated')
    })
  })

  describe('delete', () => {
    it('deletes a tag successfully', async () => {
      const tag = makeTag()
      spyOn(TagRepository, 'delete').mockResolvedValue(tag as any)

      const result = await TagService.delete('user-1', 'tag-1')
      expect(result).toEqual(tag)
    })
  })
})
