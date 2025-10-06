import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCampaignPage } from './add-campaign.page';

describe('AddCampaignPage', () => {
  let component: AddCampaignPage;
  let fixture: ComponentFixture<AddCampaignPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCampaignPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
