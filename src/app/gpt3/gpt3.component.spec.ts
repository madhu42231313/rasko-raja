import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gpt3Component } from './gpt3.component';

describe('Gpt3Component', () => {
  let component: Gpt3Component;
  let fixture: ComponentFixture<Gpt3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Gpt3Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Gpt3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
