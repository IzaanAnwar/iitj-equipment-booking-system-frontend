import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Department, Equipment, FinanceReport, Student, Supervisor, User } from '../../../../types';
import { DataTablePagination } from '@/components/ui/data-table';
import { DownloadFinanceReport } from './download-report';

interface FilterItem {
  id: string;
  name: string;
  [key: string]: any;
}

interface FilterPopoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: FilterItem | null;
  setValue: (value: FilterItem | null) => void;
  placeholder: string;
  items: FilterItem[] | undefined;
  displayKey?: string;
  onSelect: (item: FilterItem | null) => void;
}

interface FinancialReportsTableProps {
  reports: FinanceReport[];
  departments: Department[];
  supervisors: Supervisor[];
  user: User;
  equipments: Equipment[];
  students: Student[];
  isPending: boolean;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  open,
  setOpen,
  value,
  setValue,
  placeholder,
  items,
  displayKey = 'name',
  onSelect,
}) => (
  <div className="relative">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {value ? value[displayKey] : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder}...`} />
          <CommandEmpty>No {placeholder} found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {items?.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item[displayKey].toLowerCase()}
                  onSelect={(currentValue: string) => {
                    const selected = items.find((item) => item[displayKey].toLowerCase() === currentValue);
                    setValue(selected || null);
                    onSelect(selected || null);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value?.id === item.id ? 'opacity-100' : 'opacity-0')} />
                  {item[displayKey]}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
    {value && (
      <Button
        variant="ghost"
        className="absolute -right-8 top-0 h-full p-1"
        onClick={() => {
          setValue(null);
          onSelect(null);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    )}
  </div>
);

const FinancialReportsTable: React.FC<FinancialReportsTableProps> = ({
  reports,
  departments,
  supervisors,
  equipments,
  students,
  user,
  isPending,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  // Filter states
  const [selectedSupervisor, setSelectedSupervisor] = React.useState<Supervisor | null>(null);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | null>(null);
  const [selectedEquipment, setSelectedEquipment] = React.useState<FilterItem | null>(null);
  const [selectedType, setSelectedType] = React.useState<FilterItem | null>(null);

  // Popover states
  const [supervisorOpen, setSupervisorOpen] = React.useState(false);
  const [studentOpen, setStudentOpen] = React.useState(false);
  const [equipmentOpen, setEquipmentOpen] = React.useState(false);
  const [departmentOpen, setDepartmentOpen] = React.useState(false);
  const [typeOpen, setTypeOpen] = React.useState(false);

  const actionTypes = [
    { id: 'PURCHASE', name: 'Purchase' },
    { id: 'REFUND', name: 'Refund' },
    { id: 'CREDIT_ALLOTMENT', name: 'Credit Allotment' },
  ];

  const clearAllFilters = () => {
    setSelectedSupervisor(null);
    setSelectedStudent(null);
    setSelectedEquipment(null);
    setSelectedType(null);
    setGlobalFilter('');
    setSelectedDepartment(null);
  };

  const columns: ColumnDef<FinanceReport>[] = [
    {
      accessorKey: 'actionType',
      header: 'Type',
      size: 100,
    },
    {
      accessorKey: 'message',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Message
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return <div className="text-right font-medium">Rs {amount.toFixed(2)}</div>;
      },
    },

    {
      accessorKey: 'actionBy.name',
      header: 'User',
      size: 150,
    },
    {
      accessorKey: 'equipment.name',
      header: 'Equipment',
      size: 150,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return date.toLocaleDateString();
      },
    },
  ];

  const filteredData = React.useMemo(() => {
    return reports?.filter((report) => {
      const matchesSupervisor = !selectedSupervisor || report.supervisor?.id === selectedSupervisor.id;
      const matchesStudent = !selectedStudent || report.student?.id === selectedStudent.id;
      const matchesEquipment = !selectedEquipment || report.equipment?.id === selectedEquipment.id;
      const matchesType = !selectedType || report.actionType === selectedType.id;
      const matchesDepartment = !selectedDepartment || report.departmentId === selectedDepartment.id;
      return matchesSupervisor && matchesStudent && matchesEquipment && matchesType && matchesDepartment;
    });
  }, [reports, selectedSupervisor, selectedStudent, selectedEquipment, selectedType, selectedDepartment]);
  console.log({ filteredData, selectedDepartment });
  const hasActiveFilters =
    selectedSupervisor || selectedStudent || selectedEquipment || selectedType || globalFilter || selectedDepartment;

  const table = useReactTable({
    data: filteredData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearAllFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search all columns..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
            <DownloadFinanceReport reports={reports} />
          </div>
          <div className="flex flex-wrap gap-4">
            {user.role === 'admin' && (
              <FilterPopover
                open={supervisorOpen}
                setOpen={setSupervisorOpen}
                value={selectedSupervisor}
                // @ts-ignore
                setValue={setSelectedSupervisor}
                placeholder="Select Supervisor"
                items={supervisors}
                onSelect={(supervisor) => {
                  setSelectedSupervisor(supervisor as Supervisor | null);
                }}
              />
            )}

            {user.role === 'supervisor' && (
              <FilterPopover
                open={studentOpen}
                setOpen={setStudentOpen}
                value={selectedStudent}
                // @ts-ignore
                setValue={setSelectedStudent}
                placeholder="Select Student"
                items={students}
                onSelect={(student) => {
                  setSelectedStudent(student as Student | null);
                }}
              />
            )}

            <FilterPopover
              open={equipmentOpen}
              setOpen={setEquipmentOpen}
              value={selectedEquipment}
              setValue={setSelectedEquipment}
              placeholder="Select Equipment"
              items={equipments}
              onSelect={(equipment) => {
                setSelectedEquipment(equipment);
              }}
            />
            <FilterPopover
              open={departmentOpen}
              setOpen={setDepartmentOpen}
              value={selectedDepartment}
              setValue={setSelectedDepartment}
              placeholder="Select Department"
              items={departments}
              onSelect={(dept) => {
                setSelectedDepartment(dept);
              }}
            />

            <FilterPopover
              open={typeOpen}
              setOpen={setTypeOpen}
              value={selectedType}
              setValue={setSelectedType}
              placeholder="Select Type"
              items={actionTypes}
              onSelect={(type) => {
                setSelectedType(type);
              }}
            />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
};

export default FinancialReportsTable;
