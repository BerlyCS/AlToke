import { t, type UnwrapSchema } from 'elysia'
import { dbModel } from '../../db/model'

const { tags } = dbModel.insert

export const TagModel = {
  createTagBody: t.Object({
    name: tags.name,
    color: t.Optional(tags.color),
    icon: t.Optional(tags.icon),
  }),
  updateTagBody: t.Partial(
    t.Object({
      name: tags.name,
      color: tags.color,
      icon: tags.icon,
    }),
  ),
  tagResponse: t.Object(dbModel.select.tags as any),
  tagsListResponse: t.Array(t.Object(dbModel.select.tags as any)),
  errorNotFound: t.Literal('Tag not found'),
} as const

export type TagModel = {
  [k in keyof typeof TagModel]: UnwrapSchema<(typeof TagModel)[k]>
}
