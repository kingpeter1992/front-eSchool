import { Component, input, output } from '@angular/core';
import { BuildingResponse, RoomResponse } from '../../../models/school.model';
import { SCHOOL_IMPORTS } from '../../../services/school-imports';

@Component({
  selector: 'app-campus-buildings-tab',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './campus-buildings-tab.html',
  styleUrl: './campus-buildings-tab.scss',
})
export class CampusBuildingsTab {
  buildings = input<BuildingResponse[] | null>([]);
  loading = input<boolean>(false);
  canEdit = input<boolean>(false);

  openBuildingModal = output<void>();
  editBuilding = output<BuildingResponse>();
  addRoom = output<BuildingResponse>();
  editRoom = output<{ building: BuildingResponse; room: RoomResponse }>();
  addEquipment = output<RoomResponse>();
  viewEquipments = output<RoomResponse>();
}
