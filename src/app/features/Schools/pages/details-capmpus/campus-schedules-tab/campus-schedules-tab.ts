import { Component, input, output } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../../services/school-imports';
import { ScheduleDTO } from '../../../models/school.model';


const DAYS_ORDER: Record<string, string> = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche'
};
@Component({
  selector: 'app-campus-schedules-tab',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './campus-schedules-tab.html',
  styleUrl: './campus-schedules-tab.scss',
})
export class CampusSchedulesTab {
  schedules = input<ScheduleDTO[]>([]);
  canEdit = input<boolean>(false);

  openScheduleModal = output<void>();

  getDayLabel(day: string): string {
    return DAYS_ORDER[day] || day;
  }
}
