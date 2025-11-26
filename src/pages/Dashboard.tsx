import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../lib/axios';

interface WeekData {
  week_number: number;
  start_date: string;
  end_date: string;
  open: number;
  off: number;
  busy: number;
  occupied: number;
}

interface CalendarData {
  calendar_id: string;
  name: string;
  tier: string | null;
  location: string;
  year: number;
  month: number;
  weeks: WeekData[];
}

interface ArtistSummary {
  calendar_id: string;
  name: string;
  location: string;
  tier: string;
  appointmentDays: number;
  openingDays: number;
  offDays: number;
}

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAvailability = async (page: number = 1, search: string = '') => {
    setLoading(true);
    setError('');
    try {
      let url = `/artist_availability/?year=${selectedYear}&month=${selectedMonth}&page=${page}&page_size=10`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const response: any = await axiosInstance.get(url);
      setCalendarData(response.data.results.results);
      setTotalCount(response.data.count);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability(currentPage, debouncedSearch);
  }, [selectedMonth, selectedYear, currentPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedWeekIndex(0);
  }, [selectedMonth, selectedYear, debouncedSearch]);

  const availableWeeks = useMemo(() => {
    if (calendarData && calendarData.length > 0 && calendarData[0]?.weeks) {
      return calendarData[0].weeks;
    }
    return [];
  }, [calendarData]);

  const currentWeek = availableWeeks[selectedWeekIndex];

  const handlePreviousWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeekIndex(selectedWeekIndex - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeekIndex < availableWeeks.length - 1) {
      setSelectedWeekIndex(selectedWeekIndex + 1);
    }
  };

  const artistSummaries: ArtistSummary[] = useMemo(() => {
    if (!currentWeek || !calendarData || calendarData.length === 0) {
      return [];
    }
    return calendarData.map((calendar) => {
      const matchingWeek = calendar.weeks?.find(
        week => week.start_date === currentWeek.start_date && week.end_date === currentWeek.end_date
      );
      return {
        calendar_id: calendar.calendar_id,
        name: calendar.name || 'John',
        location: calendar.location || '-',
        tier: calendar.tier || '-',
        appointmentDays: matchingWeek?.occupied || 0,
        openingDays: matchingWeek?.open || 0,
        offDays: matchingWeek?.off || 0,
      };
    });
  }, [calendarData, currentWeek]);

  // Using artistSummaries directly since search is now server-side
  const filteredArtists = artistSummaries;

  const totalPages = Math.ceil(totalCount / 10);
  const startIndex = (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, totalCount);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Artist Availability</h2>
            <button
              onClick={logout}
              style={{ backgroundColor: '#edaa00' }}
              className="w-full sm:w-auto px-6 py-3 text-white text-base rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              Logout
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousWeek}
                  disabled={selectedWeekIndex === 0 || !currentWeek}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-1 px-2 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-center text-sm min-w-0">
                  {currentWeek ? (
                    <div>
                      <div className="font-medium">Week {currentWeek.week_number}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {new Date(currentWeek.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(currentWeek.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No weeks available</span>
                  )}
                </div>
                <button
                  onClick={handleNextWeek}
                  disabled={selectedWeekIndex === availableWeeks.length - 1 || !currentWeek}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artist name..."
              className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Artist Summary Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">🟢 Appointment Days</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">🔵 Opening Days</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">🔴 Off Days</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredArtists.length > 0 ? (
                      filteredArtists.map((artist) => (
                        <tr key={artist.calendar_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-left">
                            <div className="text-sm font-medium text-gray-900">{artist.name}</div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="text-sm text-gray-600">{artist.location}</div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="text-sm text-gray-600">{artist.tier}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {artist.appointmentDays}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {artist.openingDays}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              {artist.offDays}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          {searchQuery ? 'No artists found matching your search' : 'No availability data found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredArtists.length > 0 ? (
                  filteredArtists.map((artist) => (
                    <div key={artist.calendar_id} className="p-4 hover:bg-gray-50">
                      <div className="font-medium text-gray-900">{artist.name}</div>
                      <div className="text-xs text-gray-500">{artist.location}</div>
                      <div className="text-xs text-gray-500 mb-3">{artist.tier}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">🟢 Appointments</div>
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {artist.appointmentDays}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">🔵 Opening</div>
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {artist.openingDays}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">🔴 Off</div>
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {artist.offDays}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center text-gray-500 text-sm">
                    {searchQuery ? 'No artists found matching your search' : 'No availability data found'}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalCount > 0 && (
                <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                      Showing {startIndex} to {endIndex} of {totalCount} {totalCount === 1 ? 'artist' : 'artists'}
                    </div>
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </button>
                      <div className="flex gap-1">
                        {getPageNumbers().map((page, index) => (
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-1 text-gray-500 text-xs sm:text-sm">...</span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page as number)}
                              style={currentPage === page ? { backgroundColor: '#edaa00' } : {}}
                              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${
                                currentPage === page ? 'text-white' : 'border border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
