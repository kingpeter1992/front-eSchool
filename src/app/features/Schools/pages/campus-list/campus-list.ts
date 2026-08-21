import { Component, computed, input, output, signal } from '@angular/core';
import { CampusResponse } from '../../models/school.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-campus-list',
  standalone: true,
  imports: [NgClass],
  templateUrl: './campus-list.html',
  styleUrl: './campus-list.scss',
})
export class CampusList {
  campuses = input<CampusResponse[]>([]);

  openCreateModal = output<void>();
  selectCampus = output<string>();

  searchTerm = signal<string>('');
  statusFilter = signal<string>('ALL');

  filteredCampuses = computed(() => {
    const list = this.campuses() || [];
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();

    return list.filter(campus => {
      const matchesSearch =
        campus.name?.toLowerCase().includes(term) ||
        campus.id?.toLowerCase().includes(term) ||
        campus.address?.toLowerCase().includes(term) ||
        campus.city?.toLowerCase().includes(term);

      const matchesStatus = status === 'ALL' || campus.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  countByStatus(status: string): number {
    return (this.campuses() || []).filter(c => c.status === status).length;
  }

  uniqueCitiesCount = computed(() => {
    const cities = (this.campuses() || []).map(c => c.city).filter(Boolean);
    return new Set(cities).size;
  });

  onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  onAddCampus(): void {
    this.openCreateModal.emit();
  }

  onCampusClick(campusId: string): void {
    this.selectCampus.emit(campusId);
  }
}
