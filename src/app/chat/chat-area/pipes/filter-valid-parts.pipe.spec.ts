import { Part } from '@opencode-ai/sdk/client'
import { FilterValidPartsPipe } from './filter-valid-parts.pipe'

describe('FilterValidPartsPipe', () => {
  let pipe: FilterValidPartsPipe

  beforeEach(() => {
    pipe = new FilterValidPartsPipe()
  })

  it('should create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return empty array for null input', () => {
    const result = pipe.transform(null as any)
    expect(result).toEqual([])
  })

  it('should return empty array for undefined input', () => {
    const result = pipe.transform(undefined as any)
    expect(result).toEqual([])
  })

  it('should return empty array for non-array input', () => {
    const result = pipe.transform('not an array' as any)
    expect(result).toEqual([])
  })

  it('should filter out step-start parts', () => {
    const parts: Part[] = [
      { id: '1', type: 'step-start', time: { start: Date.now() } } as any,
      { id: '2', type: 'text', text: 'valid', time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('text')
  })

  it('should filter out step-finish parts', () => {
    const parts: Part[] = [
      { id: '1', type: 'step-finish', time: { start: Date.now() } } as any,
      { id: '2', type: 'text', text: 'valid', time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('text')
  })

  it('should filter out file parts', () => {
    const parts: Part[] = [
      { id: '1', type: 'file', time: { start: Date.now() } } as any,
      { id: '2', type: 'text', text: 'valid', time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('text')
  })

  it('should filter out patch parts', () => {
    const parts: Part[] = [
      { id: '1', type: 'patch', time: { start: Date.now() } } as any,
      { id: '2', type: 'text', text: 'valid', time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('text')
  })

  it('should filter out synthetic text parts', () => {
    const parts: Part[] = [
      { id: '1', type: 'text', text: 'synthetic', synthetic: true, time: { start: Date.now() } } as any,
      { id: '2', type: 'text', text: 'valid', synthetic: false, time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect((result[0] as any).synthetic).toBe(false)
  })

  it('should keep non-synthetic text parts', () => {
    const parts: Part[] = [
      { id: '1', type: 'text', text: 'valid', synthetic: false, time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect((result[0] as any).text).toBe('valid')
  })

  it('should filter out empty reasoning parts', () => {
    const parts: Part[] = [
      { id: '1', type: 'reasoning', text: '   ', time: { start: Date.now() } } as any,
      { id: '2', type: 'reasoning', text: 'valid reasoning', time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect((result[0] as any).text).toBe('valid reasoning')
  })

  it('should keep non-empty reasoning parts', () => {
    const parts: Part[] = [{ id: '1', type: 'reasoning', text: 'valid reasoning', time: { start: Date.now() } } as any]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect((result[0] as any).text).toBe('valid reasoning')
  })

  it('should keep non-synthetic text parts', () => {
    const parts: Part[] = [
      { id: '1', type: 'text', text: 'valid', synthetic: false, time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect((result[0] as any).text).toBe('valid')
  })

  it('should filter out empty reasoning parts', () => {
    const parts: Part[] = [
      { id: '1', type: 'reasoning', text: '   ', time: { start: Date.now() } } as any,
      { id: '2', type: 'reasoning', text: 'valid reasoning', time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect((result[0] as any).text).toBe('valid reasoning')
  })

  it('should keep non-empty reasoning parts', () => {
    const parts: Part[] = [{ id: '1', type: 'reasoning', text: 'valid reasoning', time: { start: Date.now() } } as any]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect((result[0] as any).text).toBe('valid reasoning')
  })

  it('should keep other valid part types', () => {
    const parts: Part[] = [
      { id: '1', type: 'tool', time: { start: Date.now() } } as any,
      { id: '2', type: 'error', time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(2)
  })

  it('should filter out null parts', () => {
    const parts: Part[] = [null as any, { id: '2', type: 'text', text: 'valid', time: { start: Date.now() } } as any]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('text')
  })

  it('should handle empty array', () => {
    const parts: Part[] = []
    const result = pipe.transform(parts)
    expect(result).toEqual([])
  })

  it('should handle complex mixed array', () => {
    const parts: Part[] = [
      null as any,
      { id: '1', type: 'step-start', time: { start: Date.now() } } as any,
      { id: '2', type: 'text', text: 'synthetic', synthetic: true, time: { start: Date.now() } } as any,
      { id: '3', type: 'text', text: 'valid', synthetic: false, time: { start: Date.now() } } as any,
      { id: '4', type: 'reasoning', text: '', time: { start: Date.now() } } as any,
      { id: '5', type: 'reasoning', text: 'valid reasoning', time: { start: Date.now() } } as any,
      { id: '6', type: 'tool', time: { start: Date.now() } } as any,
    ]

    const result = pipe.transform(parts)
    expect(result).toHaveLength(3)
    expect(result.map((p: any) => p.id)).toEqual(['3', '5', '6'])
  })
})
