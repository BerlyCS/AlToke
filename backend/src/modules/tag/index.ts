import { Elysia, status } from 'elysia'
import { authPlugin } from '../../shared/utils/auth-plugin'
import { TagModel } from './model'
import { TagService } from './service'

export const tagRoutes = new Elysia({ prefix: '/tags' })
  .use(authPlugin)
  .model(TagModel)
  .get(
    '/',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return await TagService.findAll(userId)
    },
    {
      response: TagModel.tagsListResponse,
    },
  )
  .post(
    '/',
    async ({ requireAuth, body }) => {
      const userId = requireAuth()
      return await TagService.create(userId, body)
    },
    {
      body: TagModel.createTagBody,
      response: TagModel.tagResponse,
    },
  )
  .get(
    '/:id',
    async ({ requireAuth, params: { id } }) => {
      const userId = requireAuth()
      const tag = await TagService.findById(userId, id)
      if (!tag) throw status(404, 'Tag not found' satisfies TagModel['errorNotFound'])
      return tag
    },
    {
      response: {
        200: TagModel.tagResponse,
        404: TagModel.errorNotFound,
      },
    },
  )
  .patch(
    '/:id',
    async ({ requireAuth, params: { id }, body }) => {
      const userId = requireAuth()
      const tag = await TagService.update(userId, id, body)
      if (!tag) throw status(404, 'Tag not found' satisfies TagModel['errorNotFound'])
      return tag
    },
    {
      body: TagModel.updateTagBody,
      response: {
        200: TagModel.tagResponse,
        404: TagModel.errorNotFound,
      },
    },
  )
  .delete(
    '/:id',
    async ({ requireAuth, params: { id } }) => {
      const userId = requireAuth()
      const tag = await TagService.delete(userId, id)
      if (!tag) throw status(404, 'Tag not found' satisfies TagModel['errorNotFound'])
      return tag
    },
    {
      response: {
        200: TagModel.tagResponse,
        404: TagModel.errorNotFound,
      },
    },
  )
