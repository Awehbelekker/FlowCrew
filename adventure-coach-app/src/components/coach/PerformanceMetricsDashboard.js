import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { AdvancedShadows } from '../../styles/advancedVisualEffects';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/AuthService';
import { PaymentService } from '../../services/PaymentService';
import LoadingSpinner from '../LoadingSpinner';

const { width: screenWidth } = Dimensions.get('window');

const PerformanceMetricsDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const periods = [
    { id: '7d', label: '7 Days', days: 7 },
    { id: '30d', label: '30 Days', days: 30 },
    { id: '90d', label: '3 Months', days: 90 },
    { id: '1y', label: '1 Year', days: 365 },
  ];

  useEffect(() => {
    loadMetrics();
  }, [selectedPeriod]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);

      const endDate = new Date();
      const startDate = new Date();
      const selectedPeriodData = periods.find(p => p.id === selectedPeriod);
      startDate.setDate(endDate.getDate() - selectedPeriodData.days);

      const [metricsResponse, earningsResponse, analyticsResponse] = await Promise.all([
        AuthService.apiRequest('/coach/performance-metrics', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        PaymentService.getEarnings(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ),
        AuthService.apiRequest(`/coach/analytics?period=${selectedPeriod}`)
      ]);

      setMetrics({
        ...metricsResponse.metrics,
        earnings: earningsResponse,
        analytics: analyticsResponse.analytics,
      });

      // Generate chart data
      setChartData(generateChartData(analyticsResponse.analytics));
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMetrics();
    setIsRefreshing(false);
  };

  const generateChartData = (analytics) => {
    if (!analytics) return null;

    // Generate earnings chart data
    const earningsData = analytics.dailyEarnings?.map((item, index) => ({
      x: index,
      y: item.amount / 100, // Convert cents to dollars
      label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })) || [];

    // Generate bookings chart data
    const bookingsData = analytics.dailyBookings?.map((item, index) => ({
      x: index,
      y: item.count,
      label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })) || [];

    return {
      earnings: earningsData,
      bookings: bookingsData,
    };
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.id && styles.periodButtonTextActive,
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMetricCard = (title, value, subtitle, icon, color = Colors.flowcrew.gradientStart, trend = null) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <Text style={styles.metricIconText}>{icon}</Text>
        </View>
        {trend && (
          <View style={[styles.trendIndicator, { backgroundColor: trend > 0 ? Colors.success[100] : Colors.error[100] }]}>
            <Text style={[styles.trendText, { color: trend > 0 ? Colors.success[600] : Colors.error[600] }]}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderOverviewMetrics = () => {
    if (!metrics) return null;

    return (
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Total Earnings',
          PaymentService.formatCurrency(metrics.earnings?.total_earned || 0),
          `${selectedPeriod === '7d' ? 'Last 7 days' : selectedPeriod === '30d' ? 'Last 30 days' : selectedPeriod === '90d' ? 'Last 3 months' : 'Last year'}`,
          '💰',
          Colors.flowcrew.gradientStart,
          metrics.earningsTrend
        )}

        {renderMetricCard(
          'Sessions Completed',
          metrics.totalSessions?.toString() || '0',
          `${metrics.completionRate || 0}% completion rate`,
          '🏄‍♂️',
          Colors.ocean[500],
          metrics.sessionsTrend
        )}

        {renderMetricCard(
          'Average Rating',
          metrics.averageRating ? `${metrics.averageRating.toFixed(1)} ⭐` : 'N/A',
          `${metrics.totalReviews || 0} reviews`,
          '⭐',
          Colors.warning[500],
          metrics.ratingTrend
        )}

        {renderMetricCard(
          'Response Rate',
          `${metrics.responseRate || 0}%`,
          'Avg response time: 2h',
          '💬',
          Colors.primary[500],
          metrics.responseRateTrend
        )}
      </View>
    );
  };

  const renderSimpleChart = (data, title, color, yAxisLabel) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.y));
    const chartWidth = screenWidth - (Spacing.lg * 2);
    const chartHeight = 150;
    const barWidth = (chartWidth - 40) / data.length;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.chart}>
          <View style={styles.chartArea}>
            {data.map((item, index) => {
              const barHeight = (item.y / maxValue) * (chartHeight - 40);
              return (
                <View key={index} style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: color,
                        width: barWidth - 4,
                      }
                    ]}
                  />
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <Text style={styles.yAxisLabel}>{yAxisLabel}</Text>
      </View>
    );
  };

  const renderPerformanceInsights = () => {
    if (!metrics) return null;

    const insights = [
      {
        icon: '📈',
        title: 'Peak Performance',
        description: `Your best day was ${metrics.bestDay?.date || 'N/A'} with ${metrics.bestDay?.earnings ? PaymentService.formatCurrency(metrics.bestDay.earnings) : '$0'} earned`,
        color: Colors.success[500],
      },
      {
        icon: '🎯',
        title: 'Goal Progress',
        description: `${metrics.goalProgress || 0}% towards your monthly goal of ${PaymentService.formatCurrency(metrics.monthlyGoal || 0)}`,
        color: Colors.primary[500],
      },
      {
        icon: '🔄',
        title: 'Repeat Customers',
        description: `${metrics.repeatCustomerRate || 0}% of your students book multiple sessions`,
        color: Colors.ocean[500],
      },
      {
        icon: '⏰',
        title: 'Busiest Hours',
        description: `Most bookings between ${metrics.peakHours?.start || '10:00'} - ${metrics.peakHours?.end || '16:00'}`,
        color: Colors.warning[500],
      },
    ];

    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
              <Text style={styles.insightIconText}>{insight.icon}</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderGoalSetting = () => (
    <View style={styles.goalContainer}>
      <Text style={styles.sectionTitle}>Monthly Goals</Text>
      <View style={styles.goalCard}>
        <View style={styles.goalProgress}>
          <View style={styles.goalProgressBar}>
            <View
              style={[
                styles.goalProgressFill,
                { width: `${Math.min((metrics?.goalProgress || 0), 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.goalProgressText}>
            {metrics?.goalProgress || 0}% Complete
          </Text>
        </View>

        <View style={styles.goalStats}>
          <View style={styles.goalStat}>
            <Text style={styles.goalStatValue}>
              {PaymentService.formatCurrency(metrics?.currentMonthEarnings || 0)}
            </Text>
            <Text style={styles.goalStatLabel}>Current</Text>
          </View>
          <View style={styles.goalStat}>
            <Text style={styles.goalStatValue}>
              {PaymentService.formatCurrency(metrics?.monthlyGoal || 0)}
            </Text>
            <Text style={styles.goalStatLabel}>Goal</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.setGoalButton}>
          <Text style={styles.setGoalButtonText}>Update Goal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading performance data..." />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance Dashboard</Text>
        <Text style={styles.headerSubtitle}>Track your coaching success</Text>
      </View>

      {/* Period Selector */}
      {renderPeriodSelector()}

      {/* Overview Metrics */}
      {renderOverviewMetrics()}

      {/* Charts */}
      {chartData && (
        <View style={styles.chartsSection}>
          {renderSimpleChart(
            chartData.earnings,
            'Daily Earnings',
            Colors.flowcrew.gradientStart,
            'Earnings ($)'
          )}

          {renderSimpleChart(
            chartData.bookings,
            'Daily Sessions',
            Colors.ocean[500],
            'Sessions'
          )}
        </View>
      )}

      {/* Performance Insights */}
      {renderPerformanceInsights()}

      {/* Goal Setting */}
      {renderGoalSetting()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.flowcrew.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.flowcrew.background,
  },
  header: {
    backgroundColor: Colors.flowcrew.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    ...AdvancedShadows.subtleDepth,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  periodSelector: {
    backgroundColor: Colors.flowcrew.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  periodButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
  },
  periodButtonActive: {
    backgroundColor: Colors.flowcrew.gradientStart,
  },
  periodButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  periodButtonTextActive: {
    color: Colors.flowcrew.white,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  metricCard: {
    width: (screenWidth - Spacing.lg * 3) / 2,
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...AdvancedShadows.floating,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconText: {
    fontSize: Typography.fontSize.lg,
  },
  trendIndicator: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
  },
  trendText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  metricValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs / 2,
  },
  metricTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  metricSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  chartsSection: {
    padding: Spacing.lg,
  },
  chartContainer: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...AdvancedShadows.subtleDepth,
  },
  chartTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  chart: {
    height: 150,
    justifyContent: 'flex-end',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  barLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  yAxisLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  insightsContainer: {
    padding: Spacing.lg,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...AdvancedShadows.subtleDepth,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  insightIconText: {
    fontSize: Typography.fontSize.xl,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  insightDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  goalContainer: {
    padding: Spacing.lg,
  },
  goalCard: {
    backgroundColor: Colors.flowcrew.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...AdvancedShadows.floating,
  },
  goalProgress: {
    marginBottom: Spacing.lg,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: Colors.flowcrew.gradientStart,
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  goalStat: {
    alignItems: 'center',
  },
  goalStatValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.flowcrew.gradientStart,
    marginBottom: Spacing.xs / 2,
  },
  goalStatLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  setGoalButton: {
    backgroundColor: Colors.primary[100],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  setGoalButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
});

export default PerformanceMetricsDashboard;
