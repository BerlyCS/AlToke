import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('px-4', 'py-2')
    expect(result).toContain('px-4')
    expect(result).toContain('py-2')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles single class', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('deduplicates conflicting tailwind classes', () => {
    const result = cn('px-4', 'px-6')
    expect(result).toBe('px-6')
  })

  it('handles conditional classes', () => {
    const showHidden = false
    const showActive = true
    const result = cn('base', showHidden && 'hidden', showActive && 'active')
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('hidden')
  })

  it('handles undefined and null gracefully', () => {
    const result = cn('a', undefined, null, 'b')
    expect(result).toContain('a')
    expect(result).toContain('b')
  })

  it('resolves tailwind merge conflicts correctly', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('preserves non-conflicting classes', () => {
    const result = cn('text-sm', 'font-bold', 'text-red-500')
    expect(result).toContain('font-bold')
    expect(result).toContain('text-red-500')
  })
})
