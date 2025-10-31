import { TestBed, waitForAsync } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { AppComponent } from './app.component'
import { ElectronService } from './core/services'

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    const mockElectronService = {
      ipcRenderer: {
        on: jest.fn(),
        invoke: jest.fn().mockResolvedValue({ data: null }),
        send: jest.fn(),
        removeListener: jest.fn(),
      },
      webFrame: {},
      childProcess: {},
      fs: {},
      isElectron: false,
      selectDirectory: jest.fn(),
    } as any

    void TestBed.configureTestingModule({
      declarations: [],
      imports: [AppComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ElectronService, useValue: mockElectronService },
      ],
    }).compileComponents()
  }))

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.debugElement.componentInstance
    expect(app).toBeTruthy()
  }))
})
