import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'

import { Session } from '@opencode-ai/sdk/client'
import { SessionRenamerComponent } from './session-renamer.component'

describe('SessionRenamerComponent', () => {
  let component: SessionRenamerComponent
  let fixture: ComponentFixture<SessionRenamerComponent>

  const mockSession: Session = {
    id: 'test-session-id',
    projectID: 'test-project',
    directory: '/test',
    title: 'Test Session',
    version: '1.0.0',
    time: {
      created: 1761770858288,
      updated: 1761770858288,
    },
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionRenamerComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents()

    fixture = TestBed.createComponent(SessionRenamerComponent)
    component = fixture.componentInstance

    // Set required inputs
    fixture.componentRef.setInput('visible', false)
    fixture.componentRef.setInput('session', null)

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set newName to session title when session changes', () => {
    fixture.componentRef.setInput('session', mockSession)
    fixture.detectChanges()

    expect(component.newName()).toBe('Test Session')
  })

  it('should emit renamed and hide when save is called with valid name', () => {
    const renamedSpy = jest.fn()
    const visibleChangeSpy = jest.fn()

    component.renamed.subscribe(renamedSpy)
    component.visibleChange.subscribe(visibleChangeSpy)

    component.newName.set('New Name')
    component.save()

    expect(renamedSpy).toHaveBeenCalledWith('New Name')
    expect(visibleChangeSpy).toHaveBeenCalledWith(false)
    expect(component.newName()).toBe('')
  })

  it('should trim name when saving', () => {
    const renamedSpy = jest.fn()
    const visibleChangeSpy = jest.fn()

    component.renamed.subscribe(renamedSpy)
    component.visibleChange.subscribe(visibleChangeSpy)

    component.newName.set('  New Name  ')
    component.save()

    expect(renamedSpy).toHaveBeenCalledWith('New Name')
    expect(visibleChangeSpy).toHaveBeenCalledWith(false)
  })

  it('should not emit renamed when save is called with empty name', () => {
    const renamedSpy = jest.fn()
    const visibleChangeSpy = jest.fn()

    component.renamed.subscribe(renamedSpy)
    component.visibleChange.subscribe(visibleChangeSpy)

    component.newName.set('   ')
    component.save()

    expect(renamedSpy).not.toHaveBeenCalled()
    expect(visibleChangeSpy).not.toHaveBeenCalled()
  })

  it('should emit visibleChange false when cancel is called', () => {
    const visibleChangeSpy = jest.fn()

    component.visibleChange.subscribe(visibleChangeSpy)

    component.cancel()

    expect(visibleChangeSpy).toHaveBeenCalledWith(false)
    expect(component.newName()).toBe('')
  })

  it('should emit visibleChange false when hide is called', () => {
    const visibleChangeSpy = jest.fn()

    component.visibleChange.subscribe(visibleChangeSpy)

    component.hide()

    expect(visibleChangeSpy).toHaveBeenCalledWith(false)
    expect(component.newName()).toBe('')
  })
})
