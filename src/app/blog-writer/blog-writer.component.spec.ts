import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogWriterComponent } from './blog-writer.component';

describe('BlogWriterComponent', () => {
  let component: BlogWriterComponent;
  let fixture: ComponentFixture<BlogWriterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlogWriterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogWriterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
