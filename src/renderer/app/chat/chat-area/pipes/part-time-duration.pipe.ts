import { Pipe, PipeTransform } from '@angular/core'
import { PartTime } from '../../../shared/opencode'

@Pipe({
  name: 'partTimeDuration',
})
export class PartTimeDurationPipe implements PipeTransform {
  transform(partTime: PartTime): number | null {
    if (!partTime || !partTime.end) {
      return null
    }

    return Math.round((partTime.end - partTime.start) / 1000)
  }
}
