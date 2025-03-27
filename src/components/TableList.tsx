
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Table2, Plus, Link, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import EndpointManager from '@/components/EndpointManager';

const TableList: React.FC = () => {
  const { activeConnection, tables, refreshTables, loading, error } = useDatabase();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (activeConnection) {
      refreshTables();
    }
  }, [activeConnection]);
  
  const handleRefresh = () => {
    refreshTables();
  };
  
  const handleTableClick = (tableName: string) => {
    navigate(`/table/${tableName}`);
  };
  
  if (!activeConnection) {
    return null;
  }
  
  return (
    <Card className="glass-card animate-fadeIn">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-medium flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              טבלאות מסד הנתונים
            </CardTitle>
            <CardDescription>
              בחר טבלה כדי לצפות ולערוך את הנתונים שלה
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>רענן</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/15 p-4 text-destructive">
            {error}
          </div>
        ) : tables.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-pulse">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-3 text-sm font-medium">לא נמצאו טבלאות</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              רענן כדי לבדוק אם קיימות טבלאות במסד נתונים זה
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {tables.map((table) => (
              <div key={table.name} className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="h-auto justify-start gap-3 px-4 py-3 text-right hover:bg-muted/50"
                  onClick={() => handleTableClick(table.name)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-primary/10">
                    <Table2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">{table.name}</div>
                    <div className="text-xs text-muted-foreground">
                      סכמה: {table.schema}
                    </div>
                  </div>
                </Button>
                <div className="ml-12 flex items-center">
                  <EndpointManager tableName={table.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableList;
