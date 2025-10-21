import { Pipe, PipeTransform } from '@angular/core'
import { Part } from '@opencode-ai/sdk/client'

@Pipe({
  name: 'filterValidParts',
})
export class FilterValidPartsPipe implements PipeTransform {
  transform(parts: Part[]): Part[] {
    if (!parts || !Array.isArray(parts)) {
      return []
    }

    return parts.filter((part) => {
      if (!part) {
        return false
      }

      if (['step-start', 'step-finish', 'file', 'patch'].includes(part.type)) {
        return false
      }

      if (part.type === 'text') {
        return !part.synthetic
      }

      if (part.type === 'reasoning') {
        return part.text.trim().length > 0
      }

      return true
    })
  }
}
