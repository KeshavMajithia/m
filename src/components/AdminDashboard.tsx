import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, TrendingUp, Users, Package, DollarSign, Calendar, Phone, CreditCard, MapPin, Truck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';

type Booking = Tables['bookings']['Row'] & {
  booking_id?: string;
  booking_date?: string;
};

// Helper function to safely format dates
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [devMode, setDevMode] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Check if we're in development mode (no real Supabase credentials)
  useEffect(() => {
    const checkDevMode = () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const isDevMode = !supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder');
      setDevMode(isDevMode);

      if (isDevMode) {
        console.warn('Development mode: Using Supabase with provided credentials');
      }
    };

    checkDevMode();

    if (authenticated) {
      fetchBookings();
    }
  }, [authenticated]);

  // Simple authentication - in a real app, use Supabase Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // In a real app, use Supabase Auth:
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email: 'admin@example.com',
      //   password: password
      // });

      // For now, use a simple password check
      if (password === 'admin123') {
        setAuthenticated(true);
        setError('');
      } else {
        throw new Error('Invalid password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const fetchBookings = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      // Always try to fetch from Supabase first
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setBookings([]);
        setError('No bookings found.');
        return;
      }

      // Map the data to include both Supabase fields and any legacy fields
      const formattedBookings: Booking[] = (data || []).map(booking => ({
        ...booking,
        booking_id: booking.id, // Map id to booking_id if needed
        booking_date: booking.created_at // Map created_at to booking_date if needed
      }));

      setBookings(formattedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked':
        return <Calendar className="w-4 h-4" />;
      case 'in transit':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked':
        return 'status-booked';
      case 'in transit':
        return 'status-transit';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-booked';
    }
  };

  const calculateStats = () => {
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.price_to_customer || 0), 0);
    const totalCosts = bookings.reduce((sum, booking) => sum + (booking.our_cost || 0), 0);
    const totalProfit = totalRevenue - totalCosts;

    return { totalBookings, totalRevenue, totalCosts, totalProfit };
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen">
        <header className="header-gradient px-6 py-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <Shield className="w-10 h-10 mr-4" />
              Admin Dashboard
            </h1>
            <p className="text-xl opacity-90 mb-6">Please login to access the dashboard</p>
          </div>
        </header>

        <main className="max-w-md mx-auto px-6 py-12">
          {devMode && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-fade-in">
              <p className="text-yellow-800 font-medium">⚠️ Development Mode: Supabase is not configured with real credentials.</p>
              <p className="text-yellow-700 text-sm mt-2">Login will use mock data. Use password: <strong>admin123</strong></p>
            </div>
          )}

          <div className="card-modern animate-fade-in">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Admin Login</h2>
                <p className="text-muted-foreground">Enter your credentials to access the dashboard</p>
              </div>

              <div>
                <label htmlFor="password" className="form-label flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-primary" />
                  Admin Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                Login
              </button>
            </form>
          </div>
        </main>

        <footer className="bg-white/50 backdrop-blur-sm border-t border-border py-8 text-center">

        </footer>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen">
      <header className="header-gradient px-6 py-12 text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 mr-4" />
            Admin Dashboard
          </h1>
          <p className="text-xl opacity-90 mb-6">Manage your bookings and track performance</p>
          <button
            onClick={() => setAuthenticated(false)}
            className="nav-link bg-white/20 text-white hover:bg-white/30"
          >
            <Lock className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {devMode && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-fade-in">
            <p className="text-yellow-800 font-medium">⚠️ Development Mode: Displaying mock booking data.</p>
            <p className="text-yellow-700 text-sm mt-2">Configure your .env.local file with real Supabase credentials for production use.</p>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <div className="card-modern">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="card-modern">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-success">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>

          <div className="card-modern">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Costs</p>
                <p className="text-3xl font-bold text-warning">₹{stats.totalCosts.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>

          <div className="card-modern">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className="text-3xl font-bold text-primary">₹{stats.totalProfit.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card-modern text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        ) : (
          <div className="card-modern animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <Users className="w-6 h-6 mr-3 text-primary" />
                Recent Bookings
              </h2>
              <div className="text-sm text-muted-foreground">
                {bookings.length} total bookings
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Booking ID</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Customer</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Documents</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Destination</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Courier</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Pricing</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-foreground">{booking.booking_id}</div>
                          <div className="text-sm text-muted-foreground">{booking.parcel_weight} kg</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-foreground">{booking.customer_name}</div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="w-3 h-3 mr-1" />
                            {booking.customer_phone}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <CreditCard className="w-3 h-3 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">Aadhar:</span>
                              <span className="text-foreground ml-1">{booking.customer_aadhar || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CreditCard className="w-3 h-3 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">PAN:</span>
                              <span className="text-foreground ml-1">{booking.customer_pan || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-foreground">
                            <MapPin className="w-4 h-4 mr-2 text-primary" />
                            {booking.destination_country}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-foreground font-medium">
                            <Truck className="w-4 h-4 mr-2 text-warning" />
                            {booking.selected_courier}
                          </div>
                          <div className="text-sm text-muted-foreground">{booking.selected_service}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1 text-sm">
                            <div className="text-muted-foreground">Base: ₹{booking.base_price}</div>
                            <div className="text-muted-foreground">Cost: ₹{booking.our_cost}</div>
                            <div className="font-medium text-success">Customer: ₹{booking.price_to_customer}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-2">{booking.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white/50 backdrop-blur-sm border-t border-border py-8 text-center">

      </footer>
    </div>
  );
}

export default AdminDashboard;