
import React, { useState, useEffect } from 'react';
import databaseService, { Column, Row, QueryOptions } from '@/utils/databaseService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Search, 
  ArrowUpDown,
  Edit,
  Save,
  X
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataGridProps {
  tableName: string;
}

const DataGrid: React.FC<DataGridProps> = ({ tableName }) => {
  const { toast } = useToast();
  
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editMode, setEditMode] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  
  // Load data on initial render and when query parameters change
  useEffect(() => {
    fetchData();
  }, [tableName, currentPage, pageSize, sortColumn, sortDirection]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const options: QueryOptions = {
        page: currentPage,
        pageSize,
      };
      
      // Add sort options if a sort column is selected
      if (sortColumn) {
        options.sort = { column: sortColumn, direction: sortDirection };
      }
      
      // Add filter options if there's a search value
      if (searchValue) {
        options.filters = { [columns[0]?.name || 'id']: searchValue };
      }
      
      const result = await databaseService.queryTable(tableName, options);
      
      setColumns(result.columns);
      setRows(result.rows);
      setTotalRows(result.total);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchData();
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // If already sorting by this column, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort column
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setEditingRow(null);
    setEditedValues({});
  };
  
  const startEditing = (rowIndex: number, rowData: Row) => {
    setEditingRow(rowIndex);
    setEditedValues({ ...rowData });
  };
  
  const handleInputChange = (column: string, value: any) => {
    setEditedValues((prev) => ({
      ...prev,
      [column]: value,
    }));
  };
  
  const cancelEditing = () => {
    setEditingRow(null);
    setEditedValues({});
  };
  
  const saveChanges = async () => {
    if (editingRow === null) return;
    
    const rowData = rows[editingRow];
    const idField = columns.find(col => col.name === 'id')?.name || 'id';
    const id = rowData[idField];
    
    try {
      await databaseService.updateRow(tableName, id, editedValues);
      
      // Update local state with changes
      const updatedRows = [...rows];
      updatedRows[editingRow] = { ...rowData, ...editedValues };
      setRows(updatedRows);
      
      // Reset editing state
      setEditingRow(null);
      setEditedValues({});
      
      toast({
        title: 'Changes Saved',
        description: `Successfully updated row with ID ${id}`,
      });
    } catch (err) {
      console.error('Error updating row:', err);
      toast({
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Failed to update row',
        variant: 'destructive',
      });
    }
  };
  
  const totalPages = Math.ceil(totalRows / pageSize);
  
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 focus-ring"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
        
        <Button
          variant={editMode ? "secondary" : "outline"}
          size="sm"
          onClick={toggleEditMode}
          className="gap-1"
        >
          <Edit className="h-4 w-4" />
          <span>{editMode ? "Exit Edit Mode" : "Enter Edit Mode"}</span>
        </Button>
      </div>
      
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.name} className="font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(column.name)}
                      className="h-8 p-0 font-medium"
                    >
                      {column.name}
                      <span className="ml-2">
                        {sortColumn === column.name ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </span>
                    </Button>
                  </TableHead>
                ))}
                {editMode && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.length > 0 ? (
                      columns.map((column, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))
                    ) : (
                      Array.from({ length: 5 }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))
                    )}
                    {editMode && (
                      <TableCell>
                        <Skeleton className="h-9 w-full" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={editMode ? columns.length + 1 : columns.length}
                    className="h-24 text-center"
                  >
                    <div className="text-destructive">{error}</div>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={editMode ? columns.length + 1 : columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-1 py-4">
                      <p className="text-sm text-muted-foreground">No results found</p>
                      {searchValue && (
                        <Button
                          variant="link"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setSearchValue('');
                            fetchData();
                          }}
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="group">
                    {columns.map((column) => (
                      <TableCell key={column.name}>
                        {editingRow === rowIndex ? (
                          <Input
                            value={editedValues[column.name] ?? row[column.name] ?? ''}
                            onChange={(e) => handleInputChange(column.name, e.target.value)}
                            className="h-8 focus-ring"
                          />
                        ) : (
                          <div className="truncate max-w-xs">
                            {row[column.name] === null || row[column.name] === undefined
                              ? <span className="text-muted-foreground italic">null</span>
                              : String(row[column.name])}
                          </div>
                        )}
                      </TableCell>
                    ))}
                    {editMode && (
                      <TableCell>
                        {editingRow === rowIndex ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={saveChanges}
                              className="h-8 w-8"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={cancelEditing}
                              className="h-8 w-8 text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(rowIndex, row)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {!loading && !error && rows.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium">
              {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalRows)}
            </span>{' '}
            of <span className="font-medium">{totalRows}</span> results
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Show pages around the current page
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 2) {
                  pageNum = i;
                } else if (currentPage > totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DataGrid;
