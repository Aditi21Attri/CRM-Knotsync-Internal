
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import type { Customer, User, CustomerStatus } from "@/lib/types";
import { getEmployeeNameById } from "@/lib/mockData"; // Using mockData helper for now
import { ArrowUpDown, Search, Filter, UserCircle, Edit3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const statusColors: Record<CustomerStatus, string> = {
  hot: "bg-green-500 hover:bg-green-600",
  cold: "bg-red-500 hover:bg-red-600",
  neutral: "bg-yellow-500 hover:bg-yellow-600",
};

const ITEMS_PER_PAGE = 10;

export function CustomerTableAdmin() {
  const { customers, employees, assignCustomer, updateCustomerStatus, dataLoading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all");
  const [assignedFilter, setAssignedFilter] = useState<string | "all" | "unassigned">("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  const filteredCustomers = useMemo(() => {
    let filtered = customers;
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    if (assignedFilter === "unassigned") {
        filtered = filtered.filter(c => !c.assignedTo);
    } else if (assignedFilter !== "all") {
        filtered = filtered.filter(c => c.assignedTo === assignedFilter);
    }
    return filtered;
  }, [customers, searchTerm, statusFilter, assignedFilter]);

  const sortedCustomers = useMemo(() => {
    let sortableItems = [...filteredCustomers];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCustomers, sortConfig]);

  const totalPages = Math.ceil(sortedCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = sortedCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const requestSort = (key: keyof Customer) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const SortableHead = ({ columnKey, label }: { columnKey: keyof Customer; label: string }) => (
    <TableHead onClick={() => requestSort(columnKey)} className="cursor-pointer hover:bg-muted/50">
      <div className="flex items-center">
        {label}
        {sortConfig.key === columnKey && <ArrowUpDown className="ml-2 h-4 w-4" />}
      </div>
    </TableHead>
  );
  
  const handleAssignCustomer = (customerId: string, employeeId: string | null) => {
    assignCustomer(customerId, employeeId);
  };

  const handleStatusChange = (customerId: string, newStatus: CustomerStatus) => {
    updateCustomerStatus(customerId, newStatus);
  };


  if (dataLoading) return <p>Loading customers...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers (name, email, category)..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-grow md:flex-grow-0">
                <Filter className="mr-2 h-4 w-4" /> Status: <span className="capitalize ml-1">{statusFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["all", "hot", "cold", "neutral"].map(s => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={statusFilter === s}
                  onCheckedChange={() => { setStatusFilter(s as CustomerStatus | "all"); setCurrentPage(1); }}
                  className="capitalize"
                >
                  {s}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-grow md:flex-grow-0">
                <UserCircle className="mr-2 h-4 w-4" /> Assigned: <span className="capitalize ml-1">{assignedFilter === "all" ? "All" : assignedFilter === "unassigned" ? "Unassigned" : getEmployeeNameById(assignedFilter)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Assignee</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={assignedFilter === "all"}
                onCheckedChange={() => { setAssignedFilter("all"); setCurrentPage(1); }}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={assignedFilter === "unassigned"}
                onCheckedChange={() => { setAssignedFilter("unassigned"); setCurrentPage(1); }}
              >
                Unassigned
              </DropdownMenuCheckboxItem>
              {employees.map(emp => (
                <DropdownMenuCheckboxItem
                  key={emp.id}
                  checked={assignedFilter === emp.id}
                  onCheckedChange={() => { setAssignedFilter(emp.id); setCurrentPage(1); }}
                >
                  {emp.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableCaption>
            {paginatedCustomers.length > 0 
              ? `Showing ${((currentPage - 1) * ITEMS_PER_PAGE) + 1} to ${Math.min(currentPage * ITEMS_PER_PAGE, sortedCustomers.length)} of ${sortedCustomers.length} customers.`
              : "No customers match your current filters."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Avatar</TableHead>
              <SortableHead columnKey="name" label="Name" />
              <SortableHead columnKey="email" label="Email" />
              <SortableHead columnKey="phoneNumber" label="Phone" />
              <SortableHead columnKey="category" label="Category" />
              <SortableHead columnKey="status" label="Status" />
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://placehold.co/40x40/E5EAF7/2962FF?text=${getInitials(customer.name)}`} alt={customer.name} data-ai-hint="customer avatar" />
                    <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phoneNumber}</TableCell>
                <TableCell>{customer.category || 'N/A'}</TableCell>
                <TableCell>
                   <Popover>
                    <PopoverTrigger asChild>
                        <Badge className={`cursor-pointer capitalize text-white ${statusColors[customer.status]}`}>
                        {customer.status}
                        </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0">
                        <div className="p-2 space-y-1">
                            <p className="text-sm font-medium px-2 py-1">Change Status</p>
                            {(["hot", "cold", "neutral"] as CustomerStatus[]).map(s => (
                                <Button
                                key={s}
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start capitalize ${customer.status === s ? 'bg-accent text-accent-foreground' : ''}`}
                                onClick={() => handleStatusChange(customer.id, s)}
                                >
                                {s}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                    </Popover>
                </TableCell>
                <TableCell>
                  <Select
                    value={customer.assignedTo || "unassigned"}
                    onValueChange={(value) => handleAssignCustomer(customer.id, value === "unassigned" ? null : value)}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Assign..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => alert(`View/Edit details for ${customer.name}`)} aria-label="Edit customer">
                        <Edit3 className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
             {paginatedCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
