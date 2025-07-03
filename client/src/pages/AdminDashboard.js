import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Trash2, 
  Eye,
  UserPlus,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateCashier, setShowCreateCashier] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserActivity, setShowUserActivity] = useState(false);

  // Form states
  const [cashierForm, setCashierForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, purchasesRes, productsRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/purchases/all'),
        api.get('/products')
      ]);

      setUsers(usersRes.data.users || []);
      setPurchases(purchasesRes.data.purchases || []);
      setProducts(productsRes.data.products || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCashier = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/cashiers', cashierForm);
      toast.success('Cashier created successfully');
      setShowCreateCashier(false);
      setCashierForm({ name: '', email: '', password: '' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating cashier:', error);
      toast.error(error.response?.data?.error || 'Failed to create cashier');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleViewUserActivity = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/activity`);
      setSelectedUser({ id: userId, ...response.data });
      setShowUserActivity(true);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      toast.error('Failed to fetch user activity');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = {
    totalUsers: users.length,
    totalPurchases: purchases.length,
    totalProducts: products.length,
    totalRevenue: purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, monitor sales, and oversee the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: Activity },
                { id: 'users', name: 'Users', icon: Users },
                { id: 'purchases', name: 'Purchases', icon: ShoppingCart },
                { id: 'products', name: 'Products', icon: Package }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                  <button
                    onClick={() => setShowCreateCashier(true)}
                    className="btn btn-primary flex items-center"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Cashier
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Purchases</h3>
                    <div className="space-y-3">
                      {purchases.slice(0, 5).map((purchase) => (
                        <div key={purchase.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">Order #{purchase.id.slice(-8)}</p>
                              <p className="text-sm text-gray-600">
                                {purchase.items?.length || 0} items • ${purchase.total?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(purchase.createdAt?.toDate?.() || purchase.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h3>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{user.name || user.email}</p>
                              <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(user.createdAt?.toDate?.() || user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <button
                    onClick={() => setShowCreateCashier(true)}
                    className="btn btn-primary flex items-center"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Cashier
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role || 'user'}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                              className="text-sm border-gray-300 rounded-md"
                            >
                              <option value="user">User</option>
                              <option value="cashier">Cashier</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt?.toDate?.() || user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleViewUserActivity(user.id)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Purchases Tab */}
            {activeTab === 'purchases' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">All Purchases</h2>
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Order #{purchase.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {purchase.items?.length || 0} items • Total: ${purchase.total?.toFixed(2) || '0.00'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Customer: {purchase.userEmail || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(purchase.createdAt?.toDate?.() || purchase.createdAt).toLocaleString()}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {purchase.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">All Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">${product.price}</p>
                          <p className="text-xs text-gray-500">By: {product.createdBy || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Cashier Modal */}
        {showCreateCashier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Cashier</h3>
              <form onSubmit={handleCreateCashier} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={cashierForm.name}
                    onChange={(e) => setCashierForm({ ...cashierForm, name: e.target.value })}
                    className="input mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={cashierForm.email}
                    onChange={(e) => setCashierForm({ ...cashierForm, email: e.target.value })}
                    className="input mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={cashierForm.password}
                    onChange={(e) => setCashierForm({ ...cashierForm, password: e.target.value })}
                    className="input mt-1"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Create Cashier
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateCashier(false)}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Activity Modal */}
        {showUserActivity && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
                <button
                  onClick={() => setShowUserActivity(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Purchases ({selectedUser.totalPurchases})</h4>
                  <div className="space-y-3">
                    {selectedUser.purchases?.map((purchase) => (
                      <div key={purchase.id} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-sm">Order #{purchase.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">${purchase.total?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(purchase.createdAt?.toDate?.() || purchase.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Products ({selectedUser.totalProducts})</h4>
                  <div className="space-y-3">
                    {selectedUser.products?.map((product) => (
                      <div key={product.id} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-sm text-gray-600">${product.price}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(product.createdAt?.toDate?.() || product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 