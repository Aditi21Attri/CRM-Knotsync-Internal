
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
import { ArrowUpDown, Search, Filter, UserCircle, Edit3, Tag, CalendarDays } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CustomerEditForm } from "@/components/shared/CustomerEditForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';

const statusColors: Record<CustomerStatus, string> = {
  hot: "bg-green-500 hover:bg-green-600",
  cold: "bg-red-500 hover:bg-red-600",
  neutral: "bg-yellow-500 hover:bg-yellow-600",
};

const ITEMS_PER_PAGE = 10;
const STANDARD_CUSTOMER_FIELDS = ['id', '_id', 'name', 'email', 'phoneNumber', 'category', 'status', 'assignedTo', 'notes', 'lastContacted', 'createdAt'];


export function CustomerTableAdmin() {
  const { customers, employees, assignCustomer, updateCustomerStatus, dataLoading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all");
  const [assignedFilter, setAssignedFilter] = useState<string | "all" | "unassigned">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer | string | null; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const getInitials = (name: string) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  const getEmployeeNameById = (employeeId: string | null): string => {
    if (!employeeId) return 'Unassigned';
    const employee = employees.find(user => user.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  const uniqueCategories = useMemo(() => {
    const categories = new Set(customers.map(c => c.category).filter(Boolean) as string[]);
    return ["all", ...Array.from(categories).sort()];
  }, [customers]);

  const allCustomFieldKeys = useMemo(() => {
    const keys = new Set<string>();
    customers.forEach(customer => {
      Object.keys(customer).forEach(key => {
        if (!STANDARD_CUSTOMER_FIELDS.includes(key)) {
          keys.add(key);
        }
      });
    });
    return Array.from(keys).sort();
  }, [customers]);

  const formatHeaderLabel = (key: string) => {
    if (key === 'name') return 'Name';
    if (key === 'email') return 'Email';
    if (key === 'phoneNumber') return 'Phone';
    if (key === 'category') return 'Category';
    if (key === 'status') return 'Status';
    if (key === 'createdAt') return 'Created At';
    if (key === 'lastContacted') return 'Last Contacted';
    return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid Date';
    }
  };


  const filteredCustomers = useMemo(() => {
    let filtered = customers;
    if (searchTerm) {
      filtered = filtered.filter(c =>
        Object.values(c).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
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
    if (categoryFilter !== "all") {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    return filtered;
  }, [customers, searchTerm, statusFilter, assignedFilter, categoryFilter]);

  const sortedCustomers = useMemo(() => {
    let sortableItems = [...filteredCustomers];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key! as keyof Customer];
        const valB = b[sortConfig.key! as keyof Customer];

        if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? 1 : -1; 
        if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        
        if (sortConfig.key === 'createdAt' || sortConfig.key === 'lastContacted') {
            const dateA = new Date(valA as string).getTime();
            const dateB = new Date(valB as string).getTime();
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCustomers, sortConfig]);

  const totalPages = Math.ceil(sortedCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = sortedCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const requestSort = (key: keyof Customer | string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const SortableHead = ({ columnKey, label }: { columnKey: keyof Customer | string; label: string }) => (
    <TableHead onClick={() => requestSort(columnKey)} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">
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

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  if (dataLoading) return <div className="flex justify-center items-center h-[calc(100vh-20rem)]"><LoadingSpinner message="Loading customers..." /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search all customer fields..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
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
              <Button variant="outline" className="w-full sm:w-auto">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Tag className="mr-2 h-4 w-4" /> Category: <span className="capitalize ml-1">{categoryFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {uniqueCategories.map(cat => (
                <DropdownMenuCheckboxItem
                  key={cat}
                  checked={categoryFilter === cat}
                  onCheckedChange={() => { setCategoryFilter(cat); setCurrentPage(1); }}
                  className="capitalize"
                >
                  {cat === "all" ? "All" : cat}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-lg border shadow-md overflow-x-auto">
        <Table>
          <TableCaption>
            {paginatedCustomers.length > 0 
              ? `Showing ${((currentPage - 1) * ITEMS_PER_PAGE) + 1} to ${Math.min(currentPage * ITEMS_PER_PAGE, sortedCustomers.length)} of ${sortedCustomers.length} customers.`
              : "No customers match your current filters."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] sticky left-0 bg-background z-10">Avatar</TableHead>
              <SortableHead columnKey="name" label="Name" />
              <SortableHead columnKey="email" label="Email" />
              <SortableHead columnKey="phoneNumber" label="Phone" />
              <SortableHead columnKey="category" label="Category" />
              <SortableHead columnKey="status" label="Status" />
              <TableHead>Assigned To</TableHead>
              <SortableHead columnKey="createdAt" label="Created At" />
              <SortableHead columnKey="lastContacted" label="Last Contacted" />
              {allCustomFieldKeys.map(key => (
                  <TableHead key={key} className="whitespace-nowrap">{formatHeaderLabel(key)}</TableHead>
              ))}
              <TableHead className="text-right w-[100px] sticky right-0 bg-background z-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="sticky left-0 bg-background z-10">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://placehold.co/40x40/e0e7ff/3730a3?text=${getInitials(customer.name)}`} alt={customer.name} data-ai-hint="customer avatar"/>
                    <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">{customer.name}</TableCell>
                <TableCell className="whitespace-nowrap">{customer.email}</TableCell>
                <TableCell className="whitespace-nowrap">{customer.phoneNumber}</TableCell>
                <TableCell className="whitespace-nowrap">{customer.category || 'N/A'}</TableCell>
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
                    <SelectTrigger className="w-[180px] h-9 whitespace-nowrap">
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
                <TableCell className="whitespace-nowrap">{formatDate(customer.createdAt)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(customer.lastContacted)}</TableCell>
                {allCustomFieldKeys.map(key => (
                  <TableCell key={key} className="whitespace-nowrap">
                    {String(customer[key] === undefined || customer[key] === null ? 'N/A' : customer[key])}
                  </TableCell>
                ))}
                <TableCell className="text-right sticky right-0 bg-background z-10">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCustomer(customer)} aria-label="Edit customer">
                        <Edit3 className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
             {paginatedCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={9 + allCustomFieldKeys.length + 1} className="h-24 text-center">
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
      {editingCustomer && (
        <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
            setIsEditModalOpen(isOpen);
            if (!isOpen) setEditingCustomer(null);
          }}>
          <DialogContent className="sm:max-w-[525px] p-0">
            <CustomerEditForm 
                customer={editingCustomer} 
                onFormSubmit={() => {
                    setIsEditModalOpen(false);
                    setEditingCustomer(null);
                }} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
