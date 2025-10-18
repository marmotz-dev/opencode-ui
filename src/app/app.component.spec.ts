import { TestBed, waitForAsync } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { AppComponent } from './app.component'
import { ElectronService } from './core/services'

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      declarations: [],
      imports: [AppComponent, TranslateModule.forRoot()],
      providers: [provideRouter([]), ElectronService],
    }).compileComponents()
  }))

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.debugElement.componentInstance
    expect(app).toBeTruthy()
  }))
})
