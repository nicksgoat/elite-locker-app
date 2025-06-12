/**
 * Elite Locker - Performance Utilities
 * 
 * This file contains utilities for monitoring and optimizing app performance.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Performance metrics interface
export interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
  componentName?: string;
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string = 'Unknown') {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const renderTime = now - lastRenderTime.current;
    
    renderTimes.current.push(renderTime);
    
    // Keep only last 10 render times for average calculation
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }
    
    lastRenderTime.current = now;

    // Log performance warnings
    if (renderTime > 100) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
    }

    if (renderCount.current > 50) {
      console.warn(`High render count in ${componentName}: ${renderCount.current} renders`);
    }
  });

  const getMetrics = useCallback((): PerformanceMetrics => {
    const averageRenderTime = renderTimes.current.length > 0
      ? renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
      : 0;

    return {
      renderCount: renderCount.current,
      lastRenderTime: lastRenderTime.current,
      averageRenderTime,
      componentName
    };
  }, [componentName]);

  return { getMetrics };
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage(memory.usedJSHeapSize);
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}

// Timer utility for measuring execution time
export class PerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;
  private label: string;

  constructor(label: string = 'Timer') {
    this.label = label;
  }

  start(): void {
    this.startTime = performance.now();
  }

  end(): number {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;
    
    if (duration > 100) {
      console.warn(`${this.label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  static measure<T>(label: string, fn: () => T): T {
    const timer = new PerformanceTimer(label);
    timer.start();
    const result = fn();
    timer.end();
    return result;
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const timer = new PerformanceTimer(label);
    timer.start();
    const result = await fn();
    timer.end();
    return result;
  }
}

// Debounced state hook to prevent excessive updates
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, setValue, value];
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// Memoized value hook with custom comparison
export function useMemoizedValue<T>(
  value: T,
  compare?: (prev: T, next: T) => boolean
): T {
  const ref = useRef<T>(value);

  const areEqual = compare
    ? compare(ref.current, value)
    : Object.is(ref.current, value);

  if (!areEqual) {
    ref.current = value;
  }

  return ref.current;
}

// Performance-optimized list rendering hook
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollOffset, setScrollOffset] = useState(0);

  const visibleStartIndex = Math.floor(scrollOffset / itemHeight);
  const visibleEndIndex = Math.min(
    visibleStartIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1
  );

  const visibleItems = items.slice(visibleStartIndex, visibleEndIndex + 1);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStartIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollOffset,
    visibleStartIndex,
    visibleEndIndex
  };
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (__DEV__) {
    const modules = require.cache;
    const moduleCount = Object.keys(modules).length;
    
    console.log(`📦 Bundle Analysis:`);
    console.log(`   Loaded modules: ${moduleCount}`);
    
    // Analyze large modules
    const largeModules = Object.entries(modules)
      .map(([path, module]) => ({
        path,
        size: JSON.stringify(module).length
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    console.log(`   Top 10 largest modules:`);
    largeModules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.path.split('/').pop()} (${(module.size / 1024).toFixed(2)}KB)`);
    });
  }
}

// React DevTools profiler integration
export function useProfiler(id: string, onRender?: (id: string, phase: string, actualDuration: number) => void) {
  useEffect(() => {
    if (__DEV__ && onRender) {
      // This would integrate with React DevTools Profiler
      console.log(`Profiler started for: ${id}`);
    }
  }, [id, onRender]);
}

// Performance budget checker
export interface PerformanceBudget {
  maxRenderTime: number;
  maxMemoryUsage: number;
  maxBundleSize: number;
}

export function checkPerformanceBudget(
  metrics: PerformanceMetrics,
  budget: PerformanceBudget
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  if (metrics.averageRenderTime > budget.maxRenderTime) {
    violations.push(`Render time exceeded: ${metrics.averageRenderTime}ms > ${budget.maxRenderTime}ms`);
  }

  if (metrics.memoryUsage && metrics.memoryUsage > budget.maxMemoryUsage) {
    violations.push(`Memory usage exceeded: ${metrics.memoryUsage}MB > ${budget.maxMemoryUsage}MB`);
  }

  return {
    passed: violations.length === 0,
    violations
  };
}

// Export default performance budget
export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxRenderTime: 16, // 60fps = 16.67ms per frame
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  maxBundleSize: 5 * 1024 * 1024, // 5MB
};
