import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepartidoresAdminComponent } from './repartidores-admin.component';

describe('RepartidoresAdminComponent', () => {
  let component: RepartidoresAdminComponent;
  let fixture: ComponentFixture<RepartidoresAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepartidoresAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepartidoresAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
