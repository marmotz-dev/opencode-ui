import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'relativeTime',
})
export class RelativeTimePipe implements PipeTransform {
  transform(timestamp: number) {
    return new Date(timestamp).toLocaleString()
  }
}
