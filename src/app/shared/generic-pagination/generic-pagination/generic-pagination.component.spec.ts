import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericPaginationComponent } from './generic-pagination.component';

describe('GenericPaginationComponent', () => {
  let component: GenericPaginationComponent;
  let fixture: ComponentFixture<GenericPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericPaginationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
