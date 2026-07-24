import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ViewTaskDialog from '@/components/ViewTaskDialog.vue'
import { mockTask, mockCompletedTask } from '../fixtures'

vi.mock('@internationalized/date', () => ({
  DateFormatter: class {
    format() { return '1 enero 2025' }
  },
}))

describe('ViewTaskDialog', () => {
  const stubs = {
    Dialog: { template: '<div v-if="open"><slot /></div>', props: ['open'] },
    DialogContent: { template: '<div><slot /></div>' },
    DialogHeader: { template: '<div><slot /></div>' },
    DialogTitle: { template: '<div><slot /></div>' },
    Card: { template: '<div><slot /></div>' },
    CardHeader: { template: '<div><slot /></div>' },
    CardTitle: { template: '<div><slot /></div>' },
    CardContent: { template: '<div><slot /></div>' },
    Badge: { template: '<span><slot /></span>' },
    Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
    ScrollArea: { template: '<div><slot /></div>' },
  }

  it('does not render when open is false', () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: false, task: mockTask },
      global: { stubs },
    })
    expect(wrapper.text()).not.toContain('Terminar reporte')
  })

  it('renders task title when open and task provided', () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockTask },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Terminar reporte')
  })

  it('renders task description', () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockTask },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Completar el reporte mensual de ventas')
  })

  it('shows COMPLETED status for completed task', () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockCompletedTask },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Completada')
  })

  it('shows PENDING status for pending task', () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockTask },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Pendiente')
  })

  it('renders priority label', () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockTask },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Alta')
  })

  it('renders estimated time', () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockTask },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('30 min')
  })

  it('emits toggle-status event', async () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockTask },
      global: { stubs },
    })
    const buttons = wrapper.findAll('button')
    const completeBtn = buttons.find((b) => b.text().includes('Completar'))
    if (completeBtn) {
      await completeBtn.trigger('click')
      expect(wrapper.emitted('toggle-status')).toBeTruthy()
    }
  })

  it('emits delete-task event', async () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockTask },
      global: { stubs },
    })
    const deleteBtn = wrapper.findAll('button').find((b) => b.text().includes('Eliminar'))
    if (deleteBtn) {
      await deleteBtn.trigger('click')
      expect(wrapper.emitted('delete-task')).toBeTruthy()
    }
  })

  it('emits edit-task event', async () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockTask },
      global: { stubs },
    })
    const editBtn = wrapper.findAll('button').find((b) => b.text().includes('Editar'))
    if (editBtn) {
      await editBtn.trigger('click')
      expect(wrapper.emitted('edit-task')).toBeTruthy()
    }
  })

  it('shows recurrence label', () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockTask },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Una vez')
  })

  it('renders type badge', () => {
    const wrapper = mount(ViewTaskDialog, {
      props: { open: true, task: mockTask },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Tarea')
  })
})
