import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  user_email?: string;
}

interface UserStats {
  totalUsers: number;
  newThisMonth: number;
  activeToday: number;
}

const UserDataPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats-summary'],
    queryFn: async () => {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get new users this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const { count: newThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonth.toISOString());

      // Get active users today
      const today = new Date().toISOString().split('T')[0];
      const { count: activeToday } = await supabase
        .from('user_stats')
        .select('*', { count: 'exact', head: true })
        .eq('last_active_date', today);

      return {
        totalUsers: totalUsers || 0,
        newThisMonth: newThisMonth || 0,
        activeToday: activeToday || 0,
      } as UserStats;
    },
  });

  const filteredUsers = profiles.filter(user =>
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Phone', 'Join Date', 'User ID'],
      ...filteredUsers.map(user => [
        user.full_name || 'N/A',
        user.phone || 'N/A',
        new Date(user.created_at).toLocaleDateString(),
        user.id
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">New This Month</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.newThisMonth || 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Active Today</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.activeToday || 0}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>User ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                <TableCell>{user.phone || 'N/A'}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="font-mono text-sm">{user.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {profiles.length === 0 ? 'No users found.' : 'No users found matching your search.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDataPage;