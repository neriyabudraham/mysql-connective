
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ConnectionForm from './ConnectionForm';
import { Database, LogOut, Plus, ChevronDown, User } from 'lucide-react';

const Header: React.FC = () => {
  const { connections, activeConnection, setActiveConnection, disconnectDatabase } = useDatabase();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleLogout = () => {
    disconnectDatabase();
    logout();
  };
  
  const handleSwitchConnection = (id: string) => {
    setActiveConnection(id);
  };
  
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-4">
          <Database className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-medium">מחבר MySQL</span>
        </div>
        
        {activeConnection && (
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    {activeConnection.name}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>החלף מסד נתונים</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {connections.map((connection) => (
                    <DropdownMenuItem
                      key={connection.id}
                      onClick={() => handleSwitchConnection(connection.id)}
                      disabled={connection.id === activeConnection.id}
                      className={connection.id === activeConnection.id ? "bg-muted" : ""}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      <span>{connection.name}</span>
                      {connection.id === activeConnection.id && (
                        <span className="mr-auto text-xs text-muted-foreground">פעיל</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{activeConnection.database}</span>
                {' '}@{' '}
                <span className="font-medium text-foreground">{activeConnection.host}:{activeConnection.port}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <User className="h-4 w-4" />
                      <span>{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>חשבון משתמש</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="ml-2 h-4 w-4" />
                      <span>התנתק</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>חיבור חדש</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => disconnectDatabase()}
              >
                <LogOut className="h-4 w-4" />
                <span>התנתק</span>
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>חיבור חדש למסד נתונים</DialogTitle>
            <DialogDescription>
              התחבר למסד נתונים MySQL אחר
            </DialogDescription>
          </DialogHeader>
          <ConnectionForm />
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
