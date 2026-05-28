"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, Edit3, Loader2, Mail, Plus, RefreshCw, Search, Shield, Trash2, UserRound, Users, X } from "lucide-react";

import { Employee } from "@/lib/api";

export type EmployeeFormState = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type EmployeeUpdatePayload = {
  name?: string;
  email?: string;
  role?: string;
};

const roles = ["admin", "customer_success", "analyst", "manager"];

const roleLabels: Record<string, string> = {
  admin: "Admin",
  analyst: "Analyst",
  manager: "Manager",
  customer_success: "Customer Success"
};

const roleClasses: Record<string, string> = {
  admin: "border-red-200 bg-red-50 text-red-700",
  analyst: "border-blue-200 bg-blue-50 text-blue-700",
  manager: "border-cyan-200 bg-cyan-50 text-cyan-700",
  customer_success: "border-slate-300 bg-slate-100 text-slate-800"
};

export function EmployeeAdmin({
  currentEmployee,
  employees,
  form,
  loading,
  status,
  onCreate,
  onDelete,
  onRefresh,
  onUpdate,
  setForm
}: {
  currentEmployee: Employee;
  employees: Employee[];
  form: EmployeeFormState;
  loading: boolean;
  status: string;
  onCreate: (event: FormEvent) => void;
  onDelete: (employeeId: number) => void;
  onRefresh: () => void;
  onUpdate: (employeeId: number, payload: EmployeeUpdatePayload) => void;
  setForm: (value: EmployeeFormState) => void;
}) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesQuery =
        !normalizedQuery ||
        employee.name.toLowerCase().includes(normalizedQuery) ||
        employee.email.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "all" || employee.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [employees, query, roleFilter]);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <section className="mx-auto w-full max-w-[1500px] space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-enterprise sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-fleet-700">Administracion interna</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Empleados</h2>
          <p className="mt-2 text-sm text-slate-500">Administracion de empleados internos</p>
        </div>
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-fleet-100 bg-fleet-50 px-5 text-sm font-bold text-fleet-800 transition hover:border-fleet-200 hover:bg-fleet-100 disabled:opacity-60"
          disabled={loading}
          onClick={onRefresh}
          type="button"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Actualizar
        </button>
      </div>

      {status && <Toast message={status} tone={status.toLowerCase().includes("error") || status.toLowerCase().includes("no se") ? "error" : "success"} />}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(360px,440px)_minmax(0,1fr)]">
        <EmployeeForm form={form} loading={loading} onCreate={onCreate} setForm={setForm} />
        <EmployeeCard
          currentEmployee={currentEmployee}
          employees={filteredEmployees}
          loading={loading}
          onDeleteRequest={setDeleteTarget}
          onUpdate={onUpdate}
          query={query}
          roleFilter={roleFilter}
          setQuery={setQuery}
          setRoleFilter={setRoleFilter}
          totalEmployees={employees.length}
        />
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          employee={deleteTarget}
          loading={loading}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}

function EmployeeForm({
  form,
  loading,
  onCreate,
  setForm
}: {
  form: EmployeeFormState;
  loading: boolean;
  onCreate: (event: FormEvent) => void;
  setForm: (value: EmployeeFormState) => void;
}) {
  return (
    <form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-enterprise lg:p-8" onSubmit={onCreate}>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-fleet-50 text-fleet-700">
          <UserRound className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-950">Crear empleado</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">Alta de usuarios internos con acceso a la plataforma.</p>
        </div>
      </div>

      <div className="space-y-5">
        <InputField
          icon={<UserRound className="h-4 w-4" />}
          label="Nombre"
          onChange={(value) => setForm({ ...form, name: value })}
          placeholder="Nombre completo"
          value={form.name}
        />
        <InputField
          icon={<Mail className="h-4 w-4" />}
          label="Correo"
          onChange={(value) => setForm({ ...form, email: value })}
          placeholder="usuario@empresa.com"
          type="email"
          value={form.email}
        />
        <InputField
          icon={<Shield className="h-4 w-4" />}
          label="Contrasena temporal"
          minLength={8}
          onChange={(value) => setForm({ ...form, password: value })}
          placeholder="Minimo 8 caracteres"
          type="password"
          value={form.password}
        />
        <label className="block text-sm font-semibold text-slate-700">
          Rol
          <select
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-fleet-600 focus:ring-4 focus:ring-fleet-100"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-fleet-700 px-5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-fleet-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
        Crear empleado
      </button>
    </form>
  );
}

function EmployeeCard({
  currentEmployee,
  employees,
  loading,
  onDeleteRequest,
  onUpdate,
  query,
  roleFilter,
  setQuery,
  setRoleFilter,
  totalEmployees
}: {
  currentEmployee: Employee;
  employees: Employee[];
  loading: boolean;
  onDeleteRequest: (employee: Employee) => void;
  onUpdate: (employeeId: number, payload: EmployeeUpdatePayload) => void;
  query: string;
  roleFilter: string;
  setQuery: (value: string) => void;
  setRoleFilter: (value: string) => void;
  totalEmployees: number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-enterprise">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-950">Empleados internos</h3>
            <p className="mt-1 text-sm text-slate-500">Gestiona accesos, roles y estado operativo del equipo.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-fleet-100 bg-fleet-50 px-4 py-2 text-sm font-bold text-fleet-800">
            <Users className="h-4 w-4" />
            {totalEmployees} empleados
          </div>
        </div>
        <EmployeeFilters query={query} roleFilter={roleFilter} setQuery={setQuery} setRoleFilter={setRoleFilter} />
      </div>

      <EmployeeTable
        currentEmployee={currentEmployee}
        employees={employees}
        loading={loading}
        onDeleteRequest={onDeleteRequest}
        onUpdate={onUpdate}
      />
    </div>
  );
}

function EmployeeFilters({
  query,
  roleFilter,
  setQuery,
  setRoleFilter
}: {
  query: string;
  roleFilter: string;
  setQuery: (value: string) => void;
  setRoleFilter: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
      <label className="relative block">
        <span className="sr-only">Buscar por nombre o correo</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-fleet-600 focus:ring-4 focus:ring-fleet-100"
          placeholder="Buscar por nombre o correo"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <label>
        <span className="sr-only">Filtrar por rol</span>
        <select
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-fleet-600 focus:ring-4 focus:ring-fleet-100"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="all">Todos los roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function EmployeeTable({
  currentEmployee,
  employees,
  loading,
  onDeleteRequest,
  onUpdate
}: {
  currentEmployee: Employee;
  employees: Employee[];
  loading: boolean;
  onDeleteRequest: (employee: Employee) => void;
  onUpdate: (employeeId: number, payload: EmployeeUpdatePayload) => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<EmployeeUpdatePayload>({});

  const startEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setDraft({ name: employee.name, email: employee.email, role: employee.role });
  };

  const saveEdit = (employeeId: number) => {
    onUpdate(employeeId, draft);
    setEditingId(null);
    setDraft({});
  };

  if (!employees.length) {
    return (
      <div className="p-8">
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-fleet-700 shadow-sm">
            <Users className="h-7 w-7" />
          </div>
          <h4 className="mt-5 text-lg font-bold text-slate-950">No hay empleados para mostrar</h4>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Crea un empleado o ajusta los filtros para ver usuarios internos registrados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <th className="px-6 py-4">Nombre</th>
            <th className="px-6 py-4">Correo</th>
            <th className="px-6 py-4">Rol</th>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((employee) => {
            const isEditing = editingId === employee.id;
            return (
              <tr key={employee.id} className="group bg-white transition hover:bg-fleet-50/40">
                <td className="px-6 py-5 align-middle">
                  {isEditing ? (
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-fleet-600 focus:ring-4 focus:ring-fleet-100"
                      value={draft.name || ""}
                      onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fleet-100 text-sm font-bold text-fleet-800">
                        {employee.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-950">{employee.name}</p>
                        {employee.id === currentEmployee.id && <p className="text-xs font-semibold text-fleet-700">Sesion actual</p>}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-5 align-middle">
                  {isEditing ? (
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-fleet-600 focus:ring-4 focus:ring-fleet-100"
                      value={draft.email || ""}
                      onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                    />
                  ) : (
                    <span className="text-sm text-slate-600">{employee.email}</span>
                  )}
                </td>
                <td className="px-6 py-5 align-middle">
                  {isEditing ? (
                    <select
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-fleet-600 focus:ring-4 focus:ring-fleet-100"
                      value={draft.role || employee.role}
                      onChange={(event) => setDraft({ ...draft, role: event.target.value })}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <RoleBadge role={employee.role} />
                  )}
                </td>
                <td className="px-6 py-5 align-middle text-sm text-slate-600">
                  {new Date(employee.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-6 py-5 align-middle">
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Activo
                  </span>
                </td>
                <td className="px-6 py-5 align-middle">
                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <button
                          className="inline-flex h-10 items-center justify-center rounded-lg bg-fleet-700 px-4 text-sm font-bold text-white transition hover:bg-fleet-800 disabled:opacity-60"
                          disabled={loading}
                          onClick={() => saveEdit(employee.id)}
                          type="button"
                        >
                          Guardar
                        </button>
                        <button
                          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                          onClick={() => setEditingId(null)}
                          type="button"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-fleet-100 bg-white px-4 text-sm font-bold text-fleet-800 transition hover:bg-fleet-50"
                          onClick={() => startEdit(employee)}
                          type="button"
                        >
                          <Edit3 className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={loading || employee.id === currentEmployee.id}
                          onClick={() => onDeleteRequest(employee)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${roleClasses[role] || roleClasses.analyst}`}>
      {roleLabels[role] || role}
    </span>
  );
}

function InputField({
  icon,
  label,
  minLength,
  onChange,
  placeholder,
  type = "text",
  value
}: {
  icon: ReactNode;
  label: string;
  minLength?: number;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-fleet-600 focus-within:ring-4 focus-within:ring-fleet-100">
        <span className="text-slate-400">{icon}</span>
        <input
          className="h-full min-h-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
          minLength={minLength}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          type={type}
          value={value}
        />
      </span>
    </label>
  );
}

function Toast({ message, tone }: { message: string; tone: "success" | "error" }) {
  const isError = tone === "error";
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold shadow-sm ${isError ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
      {isError ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> : <Shield className="mt-0.5 h-5 w-5 shrink-0" />}
      {message}
    </div>
  );
}

function ConfirmDeleteModal({
  employee,
  loading,
  onCancel,
  onConfirm
}: {
  employee: Employee;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={onCancel} type="button" aria-label="Cerrar modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-950">Eliminar empleado</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Esta accion eliminara el acceso de <strong>{employee.name}</strong>. No podra iniciar sesion hasta que un admin lo cree de nuevo.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            disabled={loading}
            onClick={onConfirm}
            type="button"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
