/**
 * Date formatting utilities for Elite Locker
 * A lightweight alternative to date-fns
 */

/**
 * Format a date relative to now (e.g., "5 minutes ago")
 * @param {Date} date - The date to format
 * @param {boolean} addSuffix - Whether to add "ago" suffix
 * @returns {string} - Formatted relative time
 */
export function formatRelativeTime(date, addSuffix = true) {
  if (!date || !(date instanceof Date)) {
    return 'Invalid date';
  }

  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 0) {
      return formatFutureTime(diffInSeconds * -1, addSuffix);
    }
    
    // Convert to appropriate time unit
    let value;
    let unit;
    
    if (diffInSeconds < 60) {
      value = diffInSeconds;
      unit = 'second';
    } else if (diffInSeconds < 3600) {
      value = Math.floor(diffInSeconds / 60);
      unit = 'minute';
    } else if (diffInSeconds < 86400) {
      value = Math.floor(diffInSeconds / 3600);
      unit = 'hour';
    } else if (diffInSeconds < 2592000) {
      value = Math.floor(diffInSeconds / 86400);
      unit = 'day';
    } else if (diffInSeconds < 31536000) {
      value = Math.floor(diffInSeconds / 2592000);
      unit = 'month';
    } else {
      value = Math.floor(diffInSeconds / 31536000);
      unit = 'year';
    }
    
    // Pluralize if needed
    if (value !== 1) {
      unit += 's';
    }
    
    // Add suffix if requested
    return addSuffix ? `${value} ${unit} ago` : `${value} ${unit}`;
  } catch (error) {
    return 'some time ago'; // Fallback
  }
}

/**
 * Format future relative time
 * @param {number} diffInSeconds - Difference in seconds
 * @param {boolean} addSuffix - Whether to add "in" prefix
 * @returns {string} - Formatted future time
 */
function formatFutureTime(diffInSeconds, addSuffix = true) {
  let value;
  let unit;
  
  if (diffInSeconds < 60) {
    value = diffInSeconds;
    unit = 'second';
  } else if (diffInSeconds < 3600) {
    value = Math.floor(diffInSeconds / 60);
    unit = 'minute';
  } else if (diffInSeconds < 86400) {
    value = Math.floor(diffInSeconds / 3600);
    unit = 'hour';
  } else if (diffInSeconds < 2592000) {
    value = Math.floor(diffInSeconds / 86400);
    unit = 'day';
  } else if (diffInSeconds < 31536000) {
    value = Math.floor(diffInSeconds / 2592000);
    unit = 'month';
  } else {
    value = Math.floor(diffInSeconds / 31536000);
    unit = 'year';
  }
  
  // Pluralize if needed
  if (value !== 1) {
    unit += 's';
  }
  
  // Add prefix if requested
  return addSuffix ? `in ${value} ${unit}` : `${value} ${unit}`;
}

/**
 * Format a date with a specific format
 * @param {Date} date - The date to format
 * @param {string} format - The format to use (simple formats only)
 * @returns {string} - Formatted date
 */
export function formatDate(date, format = 'medium') {
  if (!date || !(date instanceof Date)) {
    return 'Invalid date';
  }
  
  try {
    // Different preset formats
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'medium':
        return date.toLocaleDateString(undefined, {
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        });
      case 'long':
        return date.toLocaleDateString(undefined, {
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          weekday: 'long'
        });
      case 'time':
        return date.toLocaleTimeString(undefined, {
          hour: '2-digit', 
          minute: '2-digit'
        });
      case 'datetime':
        return date.toLocaleString(undefined, {
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit'
        });
      default:
        return date.toLocaleString();
    }
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Get a user-friendly string for workout duration
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration
 */
export function formatDuration(minutes) {
  if (typeof minutes !== 'number' || minutes < 0) {
    return '';
  }
  
  try {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  } catch (error) {
    return '';
  }
}

/**
 * Parse a date string safely
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} - Parsed date or null if invalid
 */
export function parseDate(dateString) {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} - Whether the date is today
 */
export function isToday(date) {
  if (!date || !(date instanceof Date)) {
    return false;
  }
  
  try {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  } catch (error) {
    return false;
  }
} 