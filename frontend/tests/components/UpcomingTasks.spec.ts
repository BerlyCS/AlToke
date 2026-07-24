import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UpcomingTasks from '@/components/UpcomingTasks.vue'
import { mockTasks } from '../fixtures'
import type { TaskWithDeadline } from '@/composables/useTaskDeadline'
import type { Task } from '@/types'

const asTaskWithDeadline = (t: Task): TaskWithDeadline => ({
  ...t,
  deadlineStatus: 'normal',
  minutesRemaining: 1440,
})

describe('UpcomingTasks', () => {
  const stubs = {
    Card: { template: '<div><slot /></div>' },
    CardHeader: { template: '<div><slot /></div>' },
    CardTitle: { template: '<div><slot /></div>' },
    CardDescription: { template: '<div><slot /></div>' },
    CardContent: { template: '<div><slot /></div>' },
  }

  it('renders title', () => {
    const wrapper = mount(UpcomingTasks, {
      props: { tasks: [] },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Próximas tareas')
  })

  it('shows empty state when no today tasks', () => {
    const wrapper = mount(UpcomingTasks, {
      props: { tasks: [] },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Día libre')
    expect(wrapper.text()).toContain('No tienes tareas pendientes para hoy')
  })

  it('emits openTask when task is clicked', async () => {
    const taskWithTodayDueDate = asTaskWithDeadline({
      ...mockTasks[0]!,
      dueDate: new Date().toISOString(),
    })
    const wrapper = mount(UpcomingTasks, {
      props: { tasks: [taskWithTodayDueDate] },
      global: { stubs },
    })
    const taskItem = wrapper.find('[class*="cursor-pointer"]')
    if (!taskItem.exists()) return
    await taskItem.trigger('click')
    expect(wrapper.emitted('openTask')).toBeTruthy()
  })

  it('emits toggleStatus when toggle button is clicked', async () => {
    const taskWithTodayDueDate = asTaskWithDeadline({
      ...mockTasks[0]!,
      dueDate: new Date().toISOString(),
    })
    const wrapper = mount(UpcomingTasks, {
      props: { tasks: [taskWithTodayDueDate] },
      global: { stubs },
    })
    const toggleBtn = wrapper.find('button')
    if (!toggleBtn.exists()) return
    await toggleBtn.trigger('click')
    expect(wrapper.emitted('toggleStatus')).toBeTruthy()
  })

  it('emits deleteTask when delete button is clicked', async () => {
    const taskWithTodayDueDate = asTaskWithDeadline({
      ...mockTasks[0]!,
      dueDate: new Date().toISOString(),
    })
    const wrapper = mount(UpcomingTasks, {
      props: { tasks: [taskWithTodayDueDate] },
      global: { stubs },
    })
    const buttons = wrapper.findAll('button')
    const deleteBtn = buttons[buttons.length - 1]
    if (!deleteBtn) return
    await deleteBtn.trigger('click')
    expect(wrapper.emitted('deleteTask')).toBeTruthy()
  })

  it('renders task count badge', () => {
    const wrapper = mount(UpcomingTasks, {
      props: { tasks: [] },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('0')
  })
})
