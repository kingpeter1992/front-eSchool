import { Component, Input, OnInit, signal } from '@angular/core';
import { AuditLog, AuditFilter, AuditService } from '../../services/audit.service';
import { SCHOOL_IMPORTS } from '../../../Schools/services/school-imports';

@Component({
  selector: 'app-audit-list',
  standalone: true,
   imports: [SCHOOL_IMPORTS],
  templateUrl: './audit-list.html',
  styleUrl: './audit-list.scss',
})
export class AuditList implements OnInit {

  @Input() schoolId?: string;

  logs = signal<AuditLog[]>([]);
  selectedLog = signal<AuditLog | null>(null);




  // Type explicitement géré pour éviter le problème d'optionalité
// Objet JS standard au lieu d'un Signal
  filters: AuditFilter = {
    page: 0,
    size: 20,
    actionType: '',
    targetEntity: '',
    fromDate: '',
    toDate: ''
  };
  constructor(private auditService: AuditService) {}


  ngOnInit(): void {
    if (this.schoolId) {
      this.filters.schoolId = this.schoolId;
    }
    this.loadLogs();
  }

  loadLogs(): void {
    this.auditService.getLogs(this.filters).subscribe(data => {
      this.logs.set(data.content);
    });
  }
  openDetails(log: AuditLog): void {
    this.selectedLog.set(log);
  }

  closeDetails(): void {
    this.selectedLog.set(null);
  }

  parseJson(jsonString?: string): any {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return jsonString;
    }
  }
}
