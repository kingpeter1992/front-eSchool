import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BuildingRequest, BuildingResponse, CampusRequest, CampusResponse, CampusStatus, CreateBuildingRequest, CreateRoomRequest, RoomRequest, RoomResponse, ScheduleDTO } from '../../models/school.model';
import { environment } from '../../../../env';

@Injectable({
  providedIn: 'root'
})
export class CampusService {



  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.BASIC_URL +'/campuses'

  // GET /api/v1/campuses?schoolId={schoolId}
  getCampusesBySchool(schoolId: string): Observable<CampusResponse[]> {
    const params = new HttpParams().set('schoolId', schoolId);
    return this.http.get<CampusResponse[]>(this.apiUrl, { params });
  }

  // GET /api/v1/campuses/{id}
  getCampusById(id: string): Observable<CampusResponse> {
    return this.http.get<CampusResponse>(`${this.apiUrl}/${id}`);
  }

  // POST /api/v1/campuses
  createCampus(dto: CampusRequest): Observable<CampusResponse> {
    return this.http.post<CampusResponse>(this.apiUrl, dto);
  }

  // DELETE /api/v1/campuses/{id}
  deleteCampus(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
updateCampus(id: string, dto: CampusRequest): Observable<CampusResponse> {
  return this.http.put<CampusResponse>(`${this.apiUrl}/${id}`, dto);
}


// UC-CAM-004 & UC-CAM-011 : Modifier le statut
  updateCampusStatus(id: string, status: CampusStatus): Observable<CampusResponse> {
    return this.http.patch<CampusResponse>(`${this.apiUrl}/${id}/status`, { status });
  }

  // UC-CAM-005 : Affecter un responsable
  assignManager(id: string, managerId: string): Observable<CampusResponse> {
    return this.http.patch<CampusResponse>(`${this.apiUrl}/${id}/manager`, { managerId });
  }

  // UC-CAM-008 : Déclarer la capacité globale
  updateCapacity(id: string, totalCapacity: number): Observable<CampusResponse> {
    return this.http.patch<CampusResponse>(`${this.apiUrl}/${id}/capacity`, { totalCapacity });
  }

  // UC-CAM-006 : Ajouter un bâtiment
  addBuilding(campusId: string, dto: BuildingRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${campusId}/buildings`, dto);
  }

  // UC-CAM-007 & UC-CAM-009 : Ajouter une salle
  addRoomToBuilding(buildingId: string, dto: RoomRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/buildings/${buildingId}/rooms`, dto);
  }


  // Bâtiments
getBuildingsByCampus(campusId: string): Observable<BuildingResponse[]> {
  return this.http.get<BuildingResponse[]>(`${this.apiUrl}/${campusId}/buildings`);
}

createBuilding(dto: CreateBuildingRequest): Observable<BuildingResponse> {
  // Extraction de campusId pour le passer dans l'URL
  const { campusId, ...body } = dto;
  return this.http.post<BuildingResponse>(`${this.apiUrl}/${campusId}/buildings`, body);
}

// Salles
createRoom(dto: CreateRoomRequest): Observable<RoomResponse> {
  const { buildingId, ...body } = dto;
  return this.http.post<RoomResponse>(`${this.apiUrl}/buildings/${buildingId}/rooms`, body);
}

// À vérifier/ajouter dans CampusService :
updateRoom(roomId: string, dto: RoomRequest): Observable<RoomResponse> {
  return this.http.put<RoomResponse>(`${this.apiUrl}/rooms/${roomId}`, dto);
}

addEquipmentToRoom(roomId: string, dto: { name: string; quantity: number; state: string }): Observable<RoomResponse> {
  return this.http.post<RoomResponse>(`${this.apiUrl}/rooms/${roomId}/equipments`, dto);
}
// Supprime un équipement d'une salle
deleteEquipment(roomId: string, equipmentId: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/rooms/${roomId}/equipments/${equipmentId}`);
}

updateEquipment(roomId: string, equipmentId: string, dto: { name: string; quantity: number; state: string }): Observable<any> {
  return this.http.put(`${this.apiUrl}/rooms/${roomId}/equipments/${equipmentId}`, dto);
}

// À ajouter dans CampusService :
updateBuilding(id: string, dto: { campusId: string; name: string; code?: string }): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/buildings/${id}`, dto);
}


// Récupérer les horaires d'un campus
  getCampusSchedules(campusId: string): Observable<ScheduleDTO[]> {
    return this.http.get<ScheduleDTO[]>(`${this.apiUrl}/${campusId}/schedules`);
  }

  // Mettre à jour les horaires
  saveCampusSchedules(campusId: string, schedules: ScheduleDTO[]): Observable<ScheduleDTO[]> {
    return this.http.put<ScheduleDTO[]>(`${this.apiUrl}/${campusId}/schedules`, { campusId, schedules });
  }

}
