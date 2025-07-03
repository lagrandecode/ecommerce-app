import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Calendar, Shield, Save } from 'lucide-react';

const Profile = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: userProfile?.displayName || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Profile Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.displayName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your display name"
                    />
                  </div>
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Display Name */}
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Display Name</p>
                    <p className="text-sm text-gray-600">{userProfile?.displayName || 'Not set'}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Email Address</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Account Role</p>
                    <p className="text-sm text-gray-600 capitalize">{user.role || 'user'}</p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {userProfile?.createdAt 
                        ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Account Status</p>
                <p className="text-2xl font-bold text-primary-600">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Account Type</p>
                <p className="text-2xl font-bold text-green-600 capitalize">{user.role || 'user'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-2xl font-bold text-blue-600">
                  {userProfile?.updatedAt 
                    ? new Date(userProfile.updatedAt).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 