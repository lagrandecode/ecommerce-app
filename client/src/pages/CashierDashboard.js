import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign, 
  Eye,
  Search,
  Filter
} from 'lucide-react';

const CashierDashboard = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showPurchaseDetail, setShowPurchaseDetail] = useState(false);

  useEffect(() => {
    if (user?.role === 'cashier') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [purchasesRes, usersRes] = await Promise.all([
        api.get('/users/purchases/all'),
        api.get('/users')
      ]);

      setPurchases(purchasesRes.data.purchases || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPurchaseDetail = (purchase) => {
    setSelectedPurchase(purchase);
    setShowPurchaseDetail(true);
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.items?.some(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesFilter = filterStatus === 'all' || purchase.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalPurchases: purchases.length,
    totalUsers: users.length,
    totalRevenue: purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0),
    completedOrders: purchases.filter(p => p.status === 'completed').length
  };

  if (!user || user.role !== 'cashier') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need cashier privileges to access this page.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cashier Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor purchases and customer activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, customers, or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Purchases</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{purchase.id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.userEmail || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{purchase.userName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {purchase.items?.length || 0} items
                      </div>
                      <div className="text-sm text-gray-500">
                        {purchase.items?.slice(0, 2).map(item => item.name).join(', ')}
                        {purchase.items?.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${purchase.total?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        purchase.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : purchase.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {purchase.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(purchase.createdAt?.toDate?.() || purchase.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewPurchaseDetail(purchase)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPurchases.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No purchases found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No purchases have been made yet.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Purchase Detail Modal */}
        {showPurchaseDetail && selectedPurchase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Details - #{selectedPurchase.id.slice(-8)}
                </h3>
                <button
                  onClick={() => setShowPurchaseDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p><span className="font-medium">Email:</span> {selectedPurchase.userEmail || 'N/A'}</p>
                    <p><span className="font-medium">Name:</span> {selectedPurchase.userName || 'N/A'}</p>
                    <p><span className="font-medium">Order Date:</span> {new Date(selectedPurchase.createdAt?.toDate?.() || selectedPurchase.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="space-y-3">
                    {selectedPurchase.items?.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-sm text-gray-600">Price: ${item.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Subtotal:</span>
                      <span>${selectedPurchase.subtotal?.toFixed(2) || selectedPurchase.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    {selectedPurchase.tax && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium">Tax:</span>
                        <span>${selectedPurchase.tax.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedPurchase.shipping && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium">Shipping:</span>
                        <span>${selectedPurchase.shipping.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                      <span className="font-bold text-lg">Total:</span>
                      <span className="font-bold text-lg">${selectedPurchase.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Status</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedPurchase.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : selectedPurchase.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedPurchase.status || 'pending'}
                    </span>
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

export default CashierDashboard; 