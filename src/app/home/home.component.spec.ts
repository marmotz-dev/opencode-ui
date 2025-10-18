import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { provideRouter } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { HomeComponent } from './home.component'

describe('HomeComponent', () => {
  let component: HomeComponent
  let fixture: ComponentFixture<HomeComponent>

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      declarations: [],
      imports: [HomeComponent, TranslateModule.forRoot()],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(HomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should render title in a h1 tag', waitForAsync(() => {
    const compiled = fixture.debugElement.nativeElement
    expect(compiled.querySelector('h1').textContent).toContain('PAGES.HOME.TITLE')
  }))
})
