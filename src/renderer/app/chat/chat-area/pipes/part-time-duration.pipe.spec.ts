import { PartTimeDurationPipe } from './part-time-duration.pipe'

describe('PartTimeDurationPipe', () => {
  let pipe: PartTimeDurationPipe

  beforeEach(() => {
    pipe = new PartTimeDurationPipe()
  })

  it('should create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return duration in seconds with start and end times', () => {
    const partTime = {
      start: 1000,
      end: 2000,
    }

    const result = pipe.transform(partTime)

    expect(result).toBe(1)
  })

  it('should return null when no end time', () => {
    const partTime = {
      start: 1000,
    }

    const result = pipe.transform(partTime)

    expect(result).toBeNull()
  })

  it('should return null for null input', () => {
    const result = pipe.transform(null as any)

    expect(result).toBeNull()
  })

  it('should calculate duration correctly', () => {
    const partTime = {
      start: 500,
      end: 2500,
    }

    const result = pipe.transform(partTime)

    expect(result).toBe(2)
  })
})
