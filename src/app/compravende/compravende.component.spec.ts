import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompravendeComponent } from './compravende.component';

describe('CompravendeComponent', () => {
  let component: CompravendeComponent;
  let fixture: ComponentFixture<CompravendeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompravendeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompravendeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
