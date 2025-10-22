// components/DashboardHeader.jsx
import React from 'react';

const DashboardHeader = ({ 
  teacher, 
  tests, 
  selectedTest, 
  onTestChange, 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'overview', name: 'Test Overview', icon: '📊' },
    { id: 'students', name: 'Student Analytics', icon: '👨‍🎓' },
    { id: 'cheating', name: 'Cheating Detection', icon: '🔍' },
    { id: 'sessions', name: 'Session Details', icon: '📝' }
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Exam Monitoring Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {teacher?.username || 'Teacher'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Tests</p>
              <p className="text-lg font-semibold">{tests.length}</p>
            </div>
          </div>
        </div>

        {/* Test Selector */}
        {tests.length > 0 && (
          <div className="pb-4 border-b border-gray-200">
            <label htmlFor="test-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Test
            </label>
            <select
              id="test-select"
              value={selectedTest?.id || ''}
              onChange={(e) => {
                const test = tests.find(t => t.id === parseInt(e.target.value));
                onTestChange(test);
              }}
              className="block w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {tests.map(test => (
                <option key={test.id} value={test.id}>
                  {test.title} ({new Date(test.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation Tabs */}
        {tests.length > 0 && (
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;