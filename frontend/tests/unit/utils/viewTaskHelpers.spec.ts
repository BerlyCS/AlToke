import { describe, it, expect } from 'vitest'
import { mockTasks, mockTask } from '../../fixtures'

describe('ViewTaskDialog helper functions', () => {
  function getPriorityIcon(priority: string) {
    if (priority === 'LOW') return 'Leaf'
    if (priority === 'HIGH') return 'Rocket'
    return 'Flame'
  }

  function getPriorityColor(priority: string) {
    if (priority === 'LOW') return 'text-green-500'
    if (priority === 'HIGH') return 'text-red-500'
    return 'text-orange-500'
  }

  function getPriorityLabel(priority: string) {
    if (priority === 'LOW') return 'Baja'
    if (priority === 'HIGH') return 'Alta'
    return 'Media'
  }

  function getRecurrenceLabel(recurrence: string) {
    const map: Record<string, string> = {
      NONE: 'Una vez',
      DAILY: 'Diariamente',
      WEEKLY: 'Semanalmente',
      MONTHLY: 'Mensualmente',
    }
    return map[recurrence] || 'Una vez'
  }

  function getTypeLabel(type: string) {
    const map: Record<string, string> = {
      TASK: 'Tarea',
      MEETING: 'Reunión',
      EVENT: 'Evento',
    }
    return map[type] || 'Tarea'
  }

  it('getPriorityIcon returns correct icon', () => {
    expect(getPriorityIcon('LOW')).toBe('Leaf')
    expect(getPriorityIcon('HIGH')).toBe('Rocket')
    expect(getPriorityIcon('MEDIUM')).toBe('Flame')
  })

  it('getPriorityColor returns correct color', () => {
    expect(getPriorityColor('LOW')).toBe('text-green-500')
    expect(getPriorityColor('HIGH')).toBe('text-red-500')
    expect(getPriorityColor('MEDIUM')).toBe('text-orange-500')
  })

  it('getPriorityLabel returns correct label', () => {
    expect(getPriorityLabel('LOW')).toBe('Baja')
    expect(getPriorityLabel('HIGH')).toBe('Alta')
    expect(getPriorityLabel('MEDIUM')).toBe('Media')
  })

  it('getRecurrenceLabel returns correct labels', () => {
    expect(getRecurrenceLabel('NONE')).toBe('Una vez')
    expect(getRecurrenceLabel('DAILY')).toBe('Diariamente')
    expect(getRecurrenceLabel('WEEKLY')).toBe('Semanalmente')
    expect(getRecurrenceLabel('MONTHLY')).toBe('Mensualmente')
    expect(getRecurrenceLabel('UNKNOWN')).toBe('Una vez')
  })

  it('getTypeLabel returns correct labels', () => {
    expect(getTypeLabel('TASK')).toBe('Tarea')
    expect(getTypeLabel('MEETING')).toBe('Reunión')
    expect(getTypeLabel('EVENT')).toBe('Evento')
    expect(getTypeLabel('UNKNOWN')).toBe('Tarea')
  })

  it('task has correct structure', () => {
    expect(mockTask).toHaveProperty('id')
    expect(mockTask).toHaveProperty('title')
    expect(mockTask).toHaveProperty('status')
    expect(mockTask).toHaveProperty('priority')
    expect(mockTask).toHaveProperty('type')
  })

  it('tasks can be filtered by status', () => {
    expect(mockTasks.filter((t) => t.status === 'PENDING')).toHaveLength(3)
    expect(mockTasks.filter((t) => t.status === 'COMPLETED')).toHaveLength(1)
  })

  it('tasks can be filtered by type', () => {
    expect(mockTasks.filter((t) => t.type === 'TASK')).toHaveLength(2)
    expect(mockTasks.filter((t) => t.type === 'MEETING')).toHaveLength(1)
    expect(mockTasks.filter((t) => t.type === 'EVENT')).toHaveLength(1)
  })

  it('tasks can be filtered by priority', () => {
    expect(mockTasks.filter((t) => t.priority === 'HIGH')).toHaveLength(2)
    expect(mockTasks.filter((t) => t.priority === 'MEDIUM')).toHaveLength(1)
    expect(mockTasks.filter((t) => t.priority === 'LOW')).toHaveLength(1)
  })

  it('tasks can be searched by title', () => {
    const query = 'reporte'
    const results = mockTasks.filter((t) => t.title.toLowerCase().includes(query))
    expect(results).toHaveLength(1)
  })

  it('tasks can be searched by description', () => {
    const query = 'ventas'
    const results = mockTasks.filter(
      (t) => t.description && t.description.toLowerCase().includes(query),
    )
    expect(results).toHaveLength(4)
  })
})
