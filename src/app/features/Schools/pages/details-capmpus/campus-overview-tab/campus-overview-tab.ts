import { Component, input } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../../services/school-imports';
import { CampusResponse } from '../../../models/school.model';

@Component({
  selector: 'app-campus-overview-tab',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './campus-overview-tab.html',
  styleUrl: './campus-overview-tab.scss',
})
export class CampusOverviewTab {
  campus = input<CampusResponse | null>(null);
}
