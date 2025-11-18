import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-students-list-page',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.scss']
})
export class StudentsListPageComponent implements OnInit {
  students: any[] = [];
  stats: any = {};
  loading = true;
  filteredStudents: any[] = [];

  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  roleFilter: 'all' | 'student' | 'admin' = 'all';
  sortOption: 'recent' | 'progress' | 'name' = 'recent';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadStats();
  }

  loadStudents(): void {
    this.userService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.userService.getStats().subscribe({
      next: (stats) => { this.stats = stats; },
      error: (error) => { console.error('Error loading stats:', error); }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  onStatusChange(value: string): void {
    this.statusFilter = value as any;
    this.applyFilters();
  }

  onRoleChange(value: string): void {
    this.roleFilter = value as any;
    this.applyFilters();
  }

  onSortChange(value: string): void {
    this.sortOption = value as any;
    this.applyFilters();
  }

  refresh(): void {
    this.loading = true;
    this.loadStudents();
    this.loadStats();
  }

  private applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    const list = (this.students || []).filter(student => {
      const matchesSearch =
        !search ||
        (student.name || '').toLowerCase().includes(search) ||
        (student.email || '').toLowerCase().includes(search);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && student.is_active !== false) ||
        (this.statusFilter === 'inactive' && student.is_active === false);

      const matchesRole =
        this.roleFilter === 'all' ||
        (this.roleFilter === 'admin' && student.is_admin) ||
        (this.roleFilter === 'student' && !student.is_admin);

      return matchesSearch && matchesStatus && matchesRole;
    });

    this.filteredStudents = list.sort((a, b) => {
      switch (this.sortOption) {
        case 'progress':
          return (b.progress ?? 0) - (a.progress ?? 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'recent':
        default: {
          const da = new Date(b.last_login || b.created_at || 0).getTime();
          const db = new Date(a.last_login || a.created_at || 0).getTime();
          return da - db;
        }
      }
    });
  }

  trackByStudent(_index: number, student: any): number | string {
    return student.id ?? student.email ?? _index;
  }

  get totalActive(): number {
    return (this.students || []).filter(s => s.is_active !== false).length;
  }

  get totalInactive(): number {
    return (this.students || []).filter(s => s.is_active === false).length;
  }

  get adminCount(): number {
    return (this.students || []).filter(s => s.is_admin).length;
  }

  get studentCount(): number {
    return (this.students || []).filter(s => !s.is_admin).length;
  }

  exportStudents(): void {
    const rows = this.students || [];
    if (!rows.length) { alert('No hay estudiantes para exportar.'); return; }

    const now = new Date();
    const ts = now.toLocaleString();
    const title = 'Reporte de Estudiantes';

    const headers = ['ID','Nombre','Email','Admin','Creado'];
    const bodyRows = rows.map((r: any) => [
      r.id ?? '', r.name ?? '', r.email ?? '', r.is_admin ? 'Si' : 'No', r.created_at ?? ''
    ]);

    const printStyles = `
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #111827; }
        h1 { font-size: 20px; margin: 0 0 6px; }
        .meta { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; }
        th { background: #f3f4f6; text-align: left; }
        tr:nth-child(even) td { background: #fafafa; }
        .footer { margin-top: 10px; font-size: 11px; color: #6b7280; }
        @media print { @page { margin: 16mm; } }
      </style>`;

    const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${bodyRows.map(cols => `<tr>${cols.map(c => `<td>${String(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    const html = `<!doctype html><html><head><meta charset="utf-8">${printStyles}</head><body>
      <h1>${title}</h1>
      <div class="meta">Generado: ${ts} - Total: ${rows.length}</div>
      <table>${thead}${tbody}</table>
      <div class="footer">Exportado desde panel Admin</div>
    </body></html>`;

    const w = window.open('', '_blank');
    if (!w) { alert('No se pudo abrir ventana de impresion'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  }
}
