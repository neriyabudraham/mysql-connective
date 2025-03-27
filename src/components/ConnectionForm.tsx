
import React, { useState } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, Database, Server, AlertCircle } from 'lucide-react';

const ConnectionForm: React.FC = () => {
  const { addConnection, loading, error } = useDatabase();
  const { toast } = useToast();
  
  const [connectionName, setConnectionName] = useState('');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3306');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connectionName || !host || !port || !username || !database) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await addConnection({
        name: connectionName,
        host,
        port: parseInt(port, 10),
        username,
        password,
        database,
      });
      
      if (success) {
        toast({
          title: 'Connection Successful',
          description: `Successfully connected to ${database} on ${host}`,
        });
        
        // Reset form
        setConnectionName('');
        setHost('localhost');
        setPort('3306');
        setUsername('');
        setPassword('');
        setDatabase('');
      } else {
        // The error is already set in the context
        toast({
          title: 'Connection Failed',
          description: error || 'Failed to connect to the database. Please check your credentials.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Connection error:', err);
      toast({
        title: 'Connection Error',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md glass-card animate-fadeIn">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl font-medium">Connect to Database</CardTitle>
        </div>
        <CardDescription>
          Enter your MySQL database credentials to connect
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connection-name">Connection Name</Label>
            <Input
              id="connection-name"
              placeholder="My Database"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              className="focus-ring"
              autoComplete="off"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <div className="relative">
                <Input
                  id="host"
                  placeholder="localhost"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="pl-9 focus-ring"
                  autoComplete="off"
                  required
                />
                <Server className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                placeholder="3306"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="focus-ring"
                autoComplete="off"
                type="number"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="root"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="focus-ring"
              autoComplete="off"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring"
              autoComplete="off"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="database">Database Name</Label>
            <Input
              id="database"
              placeholder="my_database"
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              className="focus-ring"
              autoComplete="off"
              required
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? 'Connecting...' : 'Connect'}
            {!loading && !isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConnectionForm;
