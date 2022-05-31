import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamresultsComponent } from './teamresults.component';

describe('TeamresultsComponent', () => {
  let component: TeamresultsComponent;
  let fixture: ComponentFixture<TeamresultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamresultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamresultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
