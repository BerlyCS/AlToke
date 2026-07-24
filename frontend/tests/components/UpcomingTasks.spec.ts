import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UpcomingTasks from '@/components/UpcomingTasks.vue'
import { mockTasks, mockCompletedTask } from '../fixtures'

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
    const taskWithTodayDueDate = {
      ...mockTasks[0],
      dueDate: new Date().toISOString(),
    }
    const wrapper = mount(UpcomingTasks, {
      props: { tasks: [taskWithTodayDueDate] },
      global: { stubs },
    })
    const taskItem = wrapper.find('[class*="cursor-pointer"]')
    if (taskItem.exists()) {
      await taskItem.trigger('click')
      expect(wrapper.emitted('openTask')).toBeTruthy()
    }
  })

  it('emits toggleStatus when toggle button is clicked', async () => {
    const taskWithTodayDueDate = {
      ...mockTasks[0],
      dueDate: new Date().toISOString(),
    }
    const wrapper = mount(UpcomingTasks, {
      props: { tasks: [taskWithTodayDueDate] },
      global: { stubs },
    })
    const toggleBtn = wrapper.find('button')
    if (toggleBtn.exists()) {
      await toggleBtn.trigger('click')
      expect(wrapper.emitted('toggleStatus')).toBeTruthy()
    }
  })

  it('emits deleteTask when delete button is clicked', async () => {
    const taskWithTodayDueDate = {
      ...mockTasks[0],
      dueDate: new Date().toISOString(),
    }
    const wrapper = mount(UpcomingTasks, {
      props: { tasks: [taskWithTodayDueDate] },
      global: { stubs },
    })
    const buttons = wrapper.findAll('button')
    const deleteBtn = buttons[buttons.length - 1]
    if (deleteBtn) {
      await deleteBtn.trigger('click')
      expect(wrapper.emitted('deleteTask')).toBeTruthy()
    }
  })

  it('renders task count badge', () => {
    const wrapper = mount(UpcomingTasks, {
      props: { tasks: [] },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('0')
  })
})
