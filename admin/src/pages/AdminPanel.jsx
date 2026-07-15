import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, API_BASE } from "../context/AuthContext";
import { iconForService } from "../lib/serviceIcon";

export default function AdminPanel() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    email: '',
    mobile: '',
    services: [],
    city: '',
    status: 'active',
    password: ''
  });
  const [availableServices, setAvailableServices] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "All Orders" },
    { id: "services", label: "Services" },
    { id: "providers", label: "Service Providers" },
    { id: "clients", label: "Clients" },
  ];

  // Attach the admin session token so the backend RBAC middleware authorizes
  // these cross-origin requests.
  const authFetch = (url, options = {}) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(prev => ({ ...prev, stats: true }));
      setError(prev => ({ ...prev, stats: null }));
      try {
        const response = await authFetch(`${API_BASE}/dashboard/stats`);
        const data = await response.json();
        if (response.ok) {
          setStats(data.data);
        } else {
          setError(prev => ({ ...prev, stats: data.error || "Failed to fetch stats" }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, stats: "Failed to connect to server" }));
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };
    fetchStats();
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(prev => ({ ...prev, orders: true }));
      setError(prev => ({ ...prev, orders: null }));
      try {
        const response = await authFetch(`${API_BASE}/orders`);
        const data = await response.json();
        if (response.ok) {
          setOrders(data.data || []);
        } else {
          setError(prev => ({ ...prev, orders: data.error || "Failed to fetch orders" }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, orders: "Failed to connect to server" }));
      } finally {
        setLoading(prev => ({ ...prev, orders: false }));
      }
    };
    fetchOrders();
  }, []);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(prev => ({ ...prev, services: true }));
      setError(prev => ({ ...prev, services: null }));
      try {
        const response = await authFetch(`${API_BASE}/services`);
        const data = await response.json();
        if (response.ok) {
          setServices(data.data || []);
        } else {
          setError(prev => ({ ...prev, services: data.error || "Failed to fetch services" }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, services: "Failed to connect to server" }));
      } finally {
        setLoading(prev => ({ ...prev, services: false }));
      }
    };
    fetchServices();
  }, []);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(prev => ({ ...prev, clients: true }));
      setError(prev => ({ ...prev, clients: null }));
      try {
        const response = await authFetch(`${API_BASE}/clients`);
        const data = await response.json();
        if (response.ok) {
          setClients(data.data || []);
        } else {
          setError(prev => ({ ...prev, clients: data.error || "Failed to fetch clients" }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, clients: "Failed to connect to server" }));
      } finally {
        setLoading(prev => ({ ...prev, clients: false }));
      }
    };
    fetchClients();
  }, []);

  // Fetch service providers
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(prev => ({ ...prev, providers: true }));
      setError(prev => ({ ...prev, providers: null }));
      try {
        const response = await authFetch(`${API_BASE}/service-providers`);
        const data = await response.json();
        if (response.ok) {
          setProviders(data.data || []);
        } else {
          setError(prev => ({ ...prev, providers: data.error || "Failed to fetch providers" }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, providers: "Failed to connect to server" }));
      } finally {
        setLoading(prev => ({ ...prev, providers: false }));
      }
    };
    fetchProviders();
  }, []);

  // Fetch services for dropdown
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await authFetch(`${API_BASE}/services`);
        const data = await response.json();
        if (response.ok) {
          setAvailableServices(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch services");
      }
    };
    fetchServices();
  }, []);

  // Fetch cities for dropdown
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await authFetch(`${API_BASE}/cities`);
        const data = await response.json();
        if (response.ok) {
          setAvailableCities(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch cities");
      }
    };
    fetchCities();
  }, []);

  // Assign provider to booking
  const assignProvider = async (bookingId, providerId) => {
    try {
      const response = await authFetch(`${API_BASE}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId })
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh orders to show updated provider assignment
        const ordersResponse = await authFetch(`${API_BASE}/orders`);
        const ordersData = await ordersResponse.json();
        if (ordersResponse.ok) {
          setOrders(ordersData.data || []);
        }
        setShowAssignModal(false);
        setSelectedOrder(null);
      } else {
        alert(data.error || "Failed to assign provider");
      }
    } catch (err) {
      alert("Failed to connect to server");
    }
  };

  // Add new service provider
  const addProvider = async () => {
    try {
      const response = await authFetch(`${API_BASE}/service-providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider)
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh providers list
        const providersResponse = await authFetch(`${API_BASE}/service-providers`);
        const providersData = await providersResponse.json();
        if (providersResponse.ok) {
          setProviders(providersData.data || []);
        }
        setShowAddProviderModal(false);
        setNewProvider({
          name: '',
          email: '',
          mobile: '',
          services: [],
          city: '',
          status: 'active',
          password: ''
        });
      } else {
        alert(data.error || "Failed to add provider");
      }
    } catch (err) {
      alert("Failed to connect to server");
    }
  };

  // Toggle service selection
  const toggleService = (serviceName) => {
    setNewProvider(prev => ({
      ...prev,
      services: prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName]
    }));
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(a.date) - new Date(b.date);
    } else if (sortField === 'amount') {
      comparison = (a.amount || 0) - (b.amount || 0);
    } else if (sortField === 'status') {
      comparison = (a.status || '').localeCompare(b.status || '');
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="min-h-screen bg-cream">

      {/* Navbar */}
      <header className="w-full flex items-center justify-between px-6 pt-4">

          {/* Logo */}
          <img src={import.meta.env.BASE_URL + "../images/logo.png"} alt="Kynd" className="h-10 w-auto" />

          {/* Right */}
          <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="font-semibold text-gray-900">{user?.name || 'Admin'}</span>
              <span className="text-xs text-gray-400">{user?.email}</span>
            </div>

            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center font-semibold text-brand-700">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto mt-10 px-4">

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-cocoa">
            Admin Dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            Manage orders, revenue, and services
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white inline-flex rounded-2xl p-2 shadow-sm mb-8 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-brand-500 text-cocoa shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl border border-gray-100 min-h-[420px] overflow-hidden">

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-8">
              {loading.stats ? (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-gray-500">Loading stats...</p>
                </div>
              ) : error.stats ? (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-red-500">{error.stats}</p>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-6">
                    <p className="text-sm text-brand-600 font-medium mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-cocoa">S${stats.totalRevenue?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-cocoa-50 to-cocoa-100 rounded-2xl p-6">
                    <p className="text-sm text-cocoa-600 font-medium mb-2">Total Orders</p>
                    <p className="text-3xl font-bold text-cocoa">{stats.totalOrders || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-oat to-oat/80 rounded-2xl p-6">
                    <p className="text-sm text-cocoa-600 font-medium mb-2">Total Clients</p>
                    <p className="text-3xl font-bold text-cocoa">{stats.totalClients || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-brand-200 to-brand-100 rounded-2xl p-6">
                    <p className="text-sm text-brand-700 font-medium mb-2">Growth Rate</p>
                    <p className="text-3xl font-bold text-cocoa">{stats.growthRate?.toFixed(1) || 0}%</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-gray-500">No stats available</p>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <>
              {/* Sort Header */}
              <div className="flex items-center gap-10 px-8 py-5 border-b border-gray-100 text-sm font-medium text-gray-500">
                <span className="text-gray-400">Sort by:</span>
                <button
                  onClick={() => handleSort('date')}
                  className={`${sortField === 'date' ? 'text-green-500 font-semibold' : 'hover:text-gray-700'}`}
                >
                  Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('amount')}
                  className={`${sortField === 'amount' ? 'text-green-500 font-semibold' : 'hover:text-gray-700'}`}
                >
                  Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('status')}
                  className={`${sortField === 'status' ? 'text-green-500 font-semibold' : 'hover:text-gray-700'}`}
                >
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>

              {/* Orders List */}
              <div className="p-8">
                {loading.orders ? (
                  <div className="flex items-center justify-center h-[320px]">
                    <p className="text-gray-500">Loading orders...</p>
                  </div>
                ) : error.orders ? (
                  <div className="flex items-center justify-center h-[320px]">
                    <p className="text-red-500">{error.orders}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[320px] text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      📦
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedOrders.map((order) => (
                      <div key={order.id} className="grid grid-cols-[minmax(0,1fr)_140px_100px_140px] items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold shrink-0">
                            {order.clientName?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{order.clientName || 'Unknown'}</p>
                            <p className="text-sm text-gray-500 truncate">{order.city || 'Unknown City'}</p>
                            {order.providerName && (
                              <p className="text-sm text-cocoa-600 font-medium truncate">
                                Provider: {order.providerName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">S${order.amount?.toLocaleString() || 0}</p>
                          <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex justify-center">
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
                            {order.status || 'Pending'}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowAssignModal(true);
                          }}
                          className="px-4 py-2 bg-brand-500 text-cocoa rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors justify-self-end"
                        >
                          {order.providerName ? 'Reassign' : 'Assign Provider'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="p-8">
              {loading.services ? (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-gray-500">Loading services...</p>
                </div>
              ) : error.services ? (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-red-500">{error.services}</p>
                </div>
              ) : services.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[320px] text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    🔧
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No services yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => {
                    const Icon = iconForService(service.name);
                    return (
                    <div key={service.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                        <Icon className="w-14 h-14 text-cocoa" strokeWidth={1.75} />
                      </div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-bold text-brand-600">S${service.price?.toLocaleString() || 0}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.status === 'Available' ? 'bg-brand-100 text-brand-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Service Providers Tab */}
          {activeTab === "providers" && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Service Providers</h3>
                <button
                  onClick={() => setShowAddProviderModal(true)}
                  className="px-4 py-2 bg-brand-500 text-cocoa rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
                >
                  Add Provider
                </button>
              </div>
              {loading.providers ? (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-gray-500">Loading providers...</p>
                </div>
              ) : error.providers ? (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-red-500">{error.providers}</p>
                </div>
              ) : providers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[320px] text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    👤
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No service providers yet</p>
                  <p className="text-sm text-gray-400 mt-2">Add service providers to assign them to bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-lg">
                          {provider.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{provider.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{provider.mobile || 'No phone'}</p>
                          <p className="text-sm text-gray-400">{provider.city || 'No city'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-gray-900">{provider.rating || 0}</span>
                        </div>
                        <p className="text-sm text-gray-500">{provider.total_jobs || 0} jobs</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        provider.status === 'active' ? 'bg-brand-100 text-brand-700' :
                        provider.status === 'busy' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {provider.status || 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === "clients" && (
            <div className="p-8">
              {loading.clients ? (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-gray-500">Loading clients...</p>
                </div>
              ) : error.clients ? (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-red-500">{error.clients}</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[320px] text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    👥
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No clients yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="grid grid-cols-[minmax(0,1fr)_160px_120px] items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold shrink-0">
                          {client.avatar || client.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{client.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500 truncate">{client.mobile || 'No phone'}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{client.totalOrders || 0} orders</p>
                        <p className="text-sm text-gray-500">S${(client.totalSpend || 0).toLocaleString()}</p>
                      </div>
                      <span className={`justify-self-end px-3 py-1 rounded-full text-xs font-medium ${
                        client.status === 'Active' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {client.status || 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Provider Assignment Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Service Provider</h3>
            <p className="text-gray-600 mb-4">
              Order for: <span className="font-semibold">{selectedOrder.clientName}</span>
            </p>

            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {providers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No service providers available</p>
              ) : (
                providers
                  .filter(provider => provider.status === 'active')
                  .map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => assignProvider(selectedOrder.id, provider.id)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold">
                          {provider.name?.charAt(0) || 'P'}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{provider.name}</p>
                          <p className="text-sm text-gray-500">{provider.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-gray-900">{provider.rating || 0}</span>
                        </div>
                        <p className="text-sm text-gray-500">{provider.total_jobs || 0} jobs</p>
                      </div>
                    </button>
                  ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedOrder(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Provider Modal */}
      {showAddProviderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Service Provider</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter provider name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newProvider.email}
                  onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="text"
                  value={newProvider.mobile}
                  onChange={(e) => setNewProvider({ ...newProvider, mobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newProvider.password}
                  onChange={(e) => setNewProvider({ ...newProvider, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter password for provider login"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) toggleService(e.target.value);
                  }}
                  disabled={availableServices.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                >
                  <option value="">
                    {availableServices.length === 0 ? "Loading services..." : "Add a service"}
                  </option>
                  {availableServices
                    .filter((service) => !newProvider.services.includes(service.name))
                    .map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                </select>

                {newProvider.services.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newProvider.services.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700"
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => toggleService(name)}
                          aria-label={`Remove ${name}`}
                          className="text-brand-500 hover:text-brand-800 leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  value={newProvider.city}
                  onChange={(e) => setNewProvider({ ...newProvider, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select city</option>
                  {availableCities.length === 0 ? (
                    <option value="">Loading cities...</option>
                  ) : (
                    availableCities.map((city) => (
                      <option key={city.id} value={city.cityName}>
                        {city.cityName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newProvider.status}
                  onChange={(e) => setNewProvider({ ...newProvider, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddProviderModal(false);
                  setNewProvider({
                    name: '',
                    email: '',
                    mobile: '',
                    services: [],
                    city: '',
                    status: 'active'
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addProvider}
                className="flex-1 px-4 py-2 bg-brand-500 text-cocoa rounded-xl font-medium hover:bg-brand-600 transition-colors"
              >
                Add Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
