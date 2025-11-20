import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Alert, BackHandler, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, Check, Clock, Users, BarChart3, Calendar } from 'lucide-react-native';
import { SportSelector, PlayersAndSkillStep, TimeSelector, Button, TopNav, Card, SportIcon } from '../components';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { getSports, createGameEvent, getUserGameHistory } from '../services/games';
import { getCurrentUser } from '../services/auth';
import type { Sport, SkillLevel, TimeType, TimeOfDayOption, GameEventWithDetails } from '../types';
import { SKILL_LEVELS, TIME_OF_DAY_OPTIONS, SKILL_LEVEL_LABELS } from '../types';

/**
 * PostGameScreen - Redesigned with modern UI
 * Multi-step form for posting a new game with improved visual design
 */
export const PostGameScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  // State for form steps
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // User state
  const [userId, setUserId] = useState<string | null>(null);

  // History state
  const [gameHistory, setGameHistory] = useState<GameEventWithDetails[]>([]);
  const [historyExpanded, setHistoryExpanded] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Form data state - Step 1
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  
  // Form data state - Step 2
  const [minPlayers, setMinPlayers] = useState<number>(2);
  const [maxPlayers, setMaxPlayers] = useState<number>(10);
  const [skillRestrictionEnabled, setSkillRestrictionEnabled] = useState<boolean>(false);
  const [minSkillLevel, setMinSkillLevel] = useState<SkillLevel>(SKILL_LEVELS[0]);
  const [maxSkillLevel, setMaxSkillLevel] = useState<SkillLevel>(SKILL_LEVELS[4]);

  // Auto-enable skill restriction when user changes from default "all skills" range
  const handleMinSkillLevelChange = (level: SkillLevel) => {
    setMinSkillLevel(level);
    const isFullRange = level === SKILL_LEVELS[0] && maxSkillLevel === SKILL_LEVELS[4];
    setSkillRestrictionEnabled(!isFullRange);
  };

  const handleMaxSkillLevelChange = (level: SkillLevel) => {
    setMaxSkillLevel(level);
    const isFullRange = minSkillLevel === SKILL_LEVELS[0] && level === SKILL_LEVELS[4];
    setSkillRestrictionEnabled(!isFullRange);
  };
  
  // Form data state - Step 3
  const [timeType, setTimeType] = useState<TimeType>('time_of_day');
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [timeOfDayOption, setTimeOfDayOption] = useState<TimeOfDayOption | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Android back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [currentStep]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
      } else {
        Alert.alert('Error', 'You must be logged in to post a game.');
        navigation.goBack();
        return;
      }

      const sportsData = await getSports();
      setSports(sportsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!userId) return;
    
    try {
      setHistoryLoading(true);
      const history = await getUserGameHistory(userId, 5);
      setGameHistory(history);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load previous posts.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle sport selection - auto-advance to step 2
  const handleSelectSport = (sportId: number) => {
    setSelectedSportId(sportId);
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  };

  // Handle time type change
  const handleTimeTypeChange = (type: TimeType) => {
    setTimeType(type);
    if (type === 'time_of_day') {
      setSelectedTime(null);
      setTimeOfDayOption(null);
    } else if (type === 'precise') {
      const minTime = new Date(Date.now() + 45 * 60 * 1000);
      setSelectedTime(minTime);
      setTimeOfDayOption(null);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 1 && !selectedSportId) {
      Alert.alert('Select a Sport', 'Please choose a sport to continue.');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber === 1) {
      setCurrentStep(1);
    } else if (stepNumber === 2 && selectedSportId) {
      setCurrentStep(2);
    } else if (stepNumber === 3 && selectedSportId) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !selectedSportId || !selectedTime) {
      Alert.alert('Error', 'Please complete all required fields.');
      return;
    }

    try {
      setSubmitting(true);

      const gameData = {
        sport_id: selectedSportId,
        creator_id: userId,
        min_players: minPlayers,
        max_players: maxPlayers,
        skill_level_min: skillRestrictionEnabled ? minSkillLevel : null,
        skill_level_max: skillRestrictionEnabled ? maxSkillLevel : null,
        scheduled_time: selectedTime,
        time_type: timeType,
        time_label: timeOfDayOption ? TIME_OF_DAY_OPTIONS[timeOfDayOption].label : null,
      };

      const gameId = await createGameEvent(gameData);

      Alert.alert(
        'Success!',
        'Your game has been posted and you\'ve been added as the first participant.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error posting game:', error);
      
      const isNetworkError = error instanceof Error && (
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('timeout') ||
        error.message.includes('Failed to fetch')
      );
      
      if (isNetworkError) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to post game. Please try again.', [{ text: 'OK' }]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostFromHistory = (game: GameEventWithDetails) => {
    Alert.alert(
      'Post Game',
      `Do you want to post this ${game.sport?.name} game?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            if (!userId) {
              Alert.alert('Error', 'You must be logged in to post a game.');
              return;
            }

            try {
              setSubmitting(true);

              let scheduledTime: Date;
              let timeOfDayOptionValue: TimeOfDayOption | null = null;

              if (game.time_type === 'now') {
                scheduledTime = new Date();
              } else if (game.time_type === 'time_of_day' && game.time_label) {
                const option = Object.entries(TIME_OF_DAY_OPTIONS).find(
                  ([_, value]) => value.label === game.time_label
                )?.[0] as TimeOfDayOption | undefined;
                
                if (option) {
                  timeOfDayOptionValue = option;
                  const now = new Date();
                  const optionData = TIME_OF_DAY_OPTIONS[option];
                  scheduledTime = new Date(now);
                  scheduledTime.setHours(optionData.hour, 0, 0, 0);
                  
                  if (scheduledTime <= now) {
                    scheduledTime.setDate(scheduledTime.getDate() + 1);
                  }
                } else {
                  scheduledTime = new Date(game.scheduled_time);
                }
              } else {
                const now = new Date();
                const originalDate = new Date(game.scheduled_time);
                scheduledTime = new Date(now);
                scheduledTime.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);
                
                if (scheduledTime <= now) {
                  scheduledTime.setDate(scheduledTime.getDate() + 1);
                }
              }

              const gameData = {
                sport_id: game.sport_id,
                creator_id: userId,
                min_players: game.min_players,
                max_players: game.max_players,
                skill_level_min: game.skill_level_min,
                skill_level_max: game.skill_level_max,
                scheduled_time: scheduledTime,
                time_type: game.time_type,
                time_label: timeOfDayOptionValue ? TIME_OF_DAY_OPTIONS[timeOfDayOptionValue].label : game.time_label,
              };

              const gameId = await createGameEvent(gameData);

              Alert.alert(
                'Success!',
                'Your game has been posted and you\'ve been added as the first participant.',
                [
                  { 
                    text: 'OK', 
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } catch (error) {
              console.error('Error posting game from history:', error);
              
              const isNetworkError = error instanceof Error && (
                error.message.includes('network') ||
                error.message.includes('fetch') ||
                error.message.includes('Network request failed') ||
                error.message.includes('timeout') ||
                error.message.includes('Failed to fetch')
              );
              
              if (isNetworkError) {
                Alert.alert(
                  'Connection Error',
                  'Unable to connect to the server. Please check your internet connection and try again.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Error', 'Failed to post game. Please try again.', [{ text: 'OK' }]);
              }
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const formatHistoryTime = (dateString: string, timeType: TimeType, timeLabel: string | null): string => {
    if (timeType === 'now') return 'Now';
    if (timeType === 'time_of_day' && timeLabel) {
      // Check if time_label already contains "Tomorrow" (e.g., "Tomorrow Morning")
      if (timeLabel.toLowerCase().includes('tomorrow')) {
        return timeLabel;
      }
      // Otherwise, check if the scheduled time is today or tomorrow
      const dayLabel = getDayLabel(dateString);
      return dayLabel ? `${dayLabel} ${timeLabel}` : timeLabel;
    }
    if (timeType === 'precise') {
      const date = new Date(dateString);
      const dayLabel = getDayLabel(dateString);
      const timeString = date.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      return dayLabel ? `${dayLabel} at ${timeString}` : timeString;
    }
    return timeLabel || timeType;
  };

  const getDayLabel = (dateString: string): 'Today' | 'Tomorrow' | null => {
    const date = new Date(dateString);
    const now = new Date();
    
    const isToday = date.getFullYear() === now.getFullYear() &&
                     date.getMonth() === now.getMonth() &&
                     date.getDate() === now.getDate();
    
    if (isToday) return 'Today';
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.getFullYear() === tomorrow.getFullYear() &&
                        date.getMonth() === tomorrow.getMonth() &&
                        date.getDate() === tomorrow.getDate();
    
    if (isTomorrow) return 'Tomorrow';
    return null;
  };

  const isTimeTooClose = (dateString: string, timeType: TimeType): boolean => {
    if (timeType === 'now') return true;
    
    const now = new Date();
    const originalDate = new Date(dateString);
    
    if (timeType === 'precise') {
      const nextOccurrence = new Date(now);
      nextOccurrence.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);
      
      if (nextOccurrence <= now) {
        nextOccurrence.setDate(nextOccurrence.getDate() + 1);
      }
      
      const diffInMinutes = (nextOccurrence.getTime() - now.getTime()) / (1000 * 60);
      return diffInMinutes < 45;
    }
    
    const nextOccurrence = new Date(originalDate);
    if (nextOccurrence <= now) {
      return false;
    }
    
    const diffInMinutes = (nextOccurrence.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes < 45;
  };

  // Render history section
  const renderHistory = () => {
    if (currentStep !== 1 || loading) return null;

    return (
      <View style={styles.historySection}>
        <TouchableOpacity
          style={styles.historyHeader}
          onPress={() => {
            if (historyExpanded) {
              setHistoryExpanded(false);
            } else {
              setHistoryExpanded(true);
              if (gameHistory.length === 0) {
                loadHistory();
              }
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.historyHeaderContent}>
            <View style={styles.historyHeaderLeft}>
              <Calendar size={20} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.historyTitle}>Previous Posts</Text>
            </View>
            <ChevronRight 
              size={20} 
              color={Colors.textSecondary} 
              style={[styles.historyChevron, historyExpanded && styles.historyChevronExpanded]}
            />
          </View>
          <Text style={styles.historySubtitle}>
            {historyExpanded ? 'Tap to collapse' : 'Tap to view and reuse your previous game posts'}
          </Text>
        </TouchableOpacity>

        {historyExpanded && (
          <View style={styles.historyContent}>
            {historyLoading ? (
              <View style={styles.historyLoaderContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.historyLoaderText}>Loading previous posts...</Text>
              </View>
            ) : gameHistory.length === 0 ? (
              <View style={styles.historyEmptyContainer}>
                <Text style={styles.historyEmpty}>No previous posts found.</Text>
                <Text style={styles.historyEmptySubtext}>Create your first game to get started!</Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.historyScroll}
                contentContainerStyle={styles.historyScrollContent}
              >
                {gameHistory.map((game) => {
                  const tooClose = isTimeTooClose(game.scheduled_time, game.time_type);
                  return (
                    <TouchableOpacity
                      key={game.id}
                      style={[
                        styles.historyCard,
                        tooClose && styles.historyCardDisabled
                      ]}
                      onPress={() => !tooClose && handlePostFromHistory(game)}
                      disabled={tooClose}
                      activeOpacity={0.7}
                    >
                      <View style={styles.historyCardHeader}>
                        <SportIcon sport={game.sport} size={24} />
                        <Text style={[
                          styles.historyCardSport,
                          tooClose && styles.historyCardTextDisabled
                        ]}>
                          {game.sport?.name}
                        </Text>
                      </View>
                      
                      <View style={styles.historyCardDetails}>
                        <View style={styles.historyCardRow}>
                          <Users size={14} color={Colors.textSecondary} strokeWidth={2} />
                          <Text style={[
                            styles.historyCardValue,
                            tooClose && styles.historyCardTextDisabled
                          ]}>
                            {game.min_players}-{game.max_players} players
                          </Text>
                        </View>
                        
                        <View style={styles.historyCardRow}>
                          <BarChart3 size={14} color={Colors.textSecondary} strokeWidth={2} />
                          <Text style={[
                            styles.historyCardValue,
                            tooClose && styles.historyCardTextDisabled
                          ]}>
                            {game.skill_level_min && game.skill_level_max
                              ? `${SKILL_LEVEL_LABELS[game.skill_level_min as SkillLevel]} - ${SKILL_LEVEL_LABELS[game.skill_level_max as SkillLevel]}`
                              : 'All levels'}
                          </Text>
                        </View>
                        
                        <View style={styles.historyCardRow}>
                          <Clock size={14} color={Colors.textSecondary} strokeWidth={2} />
                          <Text style={[
                            styles.historyCardValue,
                            tooClose && styles.historyCardTextDisabled
                          ]}>
                            {formatHistoryTime(game.scheduled_time, game.time_type, game.time_label)}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.historyCardFooter}>
                        <Text style={[
                          styles.historyCardAction,
                          tooClose && styles.historyCardTextDisabled
                        ]}>
                          {tooClose ? 'Too soon to post' : 'Tap to post again →'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    );
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Sport', canNavigate: true },
      { number: 2, label: 'Players & Skill', canNavigate: selectedSportId !== null },
      { number: 3, label: 'Time', canNavigate: selectedSportId !== null },
    ];

    return (
      <View style={styles.stepIndicatorContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => handleStepClick(step.number)}
              disabled={!step.canNavigate}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.stepCircle,
                  step.number === currentStep && styles.stepCircleActive,
                  step.number < currentStep && styles.stepCircleCompleted,
                  !step.canNavigate && styles.stepCircleDisabled,
                ]}
              >
                {step.number < currentStep ? (
                  <Check size={16} color={Colors.textInverse} strokeWidth={3} />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      (step.number === currentStep || step.number < currentStep) &&
                        styles.stepNumberActive,
                    ]}
                  >
                    {step.number}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  step.number === currentStep && styles.stepLabelActive,
                  !step.canNavigate && styles.stepLabelDisabled,
                ]}
              >
                {step.label}
              </Text>
            </TouchableOpacity>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  step.number < currentStep && styles.stepLineCompleted,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading sports...</Text>
        </View>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <SportSelector
            sports={sports}
            selectedSportId={selectedSportId}
            onSelectSport={handleSelectSport}
          />
        );

      case 2:
        return (
          <PlayersAndSkillStep
            minPlayers={minPlayers}
            maxPlayers={maxPlayers}
            onMinPlayersChange={setMinPlayers}
            onMaxPlayersChange={setMaxPlayers}
            minSkillLevel={minSkillLevel}
            maxSkillLevel={maxSkillLevel}
            onMinSkillLevelChange={handleMinSkillLevelChange}
            onMaxSkillLevelChange={handleMaxSkillLevelChange}
            absoluteMinPlayers={2}
            absoluteMaxPlayers={20}
          />
        );

      case 3:
        return (
          <TimeSelector
            timeType={timeType}
            selectedTime={selectedTime}
            timeOfDayOption={timeOfDayOption}
            onTimeTypeChange={handleTimeTypeChange}
            onTimeChange={setSelectedTime}
            onTimeOfDayChange={setTimeOfDayOption}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TopNav
        title="Post a Game"
        centered
        leftAction={{
          icon: ArrowLeft,
          onPress: handleBack,
        }}
      />

      {/* Step Indicator */}
      <Card style={styles.stepIndicatorCard}>
        {renderStepIndicator()}
      </Card>

      {/* Step content with history (for step 1) */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* History section - only on step 1 */}
        {currentStep === 1 && renderHistory()}
        
        {/* Step content */}
        {renderStepContent()}
      </ScrollView>

      {/* Navigation buttons */}
      {currentStep > 1 && !loading && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <View style={styles.footerButtonLeft}>
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              size="medium"
              fullWidth
              disabled={submitting}
            />
          </View>
          <View style={styles.footerButtonRight}>
            <Button
              title={currentStep === 3 ? (submitting ? 'Posting...' : 'Post Game') : 'Next'}
              onPress={handleNext}
              size="medium"
              fullWidth
              disabled={submitting}
              loading={submitting && currentStep === 3}
              rightIcon={currentStep === 3 && !submitting ? ChevronRight : undefined}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  // Step Indicator
  stepIndicatorCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 0,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.small,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepCircleDisabled: {
    opacity: 0.4,
  },
  stepNumber: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  stepNumberActive: {
    color: Colors.textInverse,
  },
  stepLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepLabelActive: {
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  stepLabelDisabled: {
    opacity: 0.4,
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
    marginBottom: 20,
    borderRadius: 2,
  },
  stepLineCompleted: {
    backgroundColor: Colors.success,
  },
  // History Section
  historySection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  historyHeader: {
    padding: Spacing.md,
  },
  historyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  historyTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  historySubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  historyChevron: {
    transform: [{ rotate: '-90deg' }],
  },
  historyChevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  historyContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  historyLoaderContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  historyLoaderText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  historyEmptyContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  historyEmpty: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  historyEmptySubtext: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  historyScroll: {
    paddingVertical: Spacing.md,
  },
  historyScrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  historyCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 200,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  historyCardDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.backgroundTertiary,
    borderColor: Colors.borderLight,
  },
  historyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  historyCardSport: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  historyCardDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  historyCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  historyCardValue: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    flex: 1,
  },
  historyCardFooter: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  historyCardAction: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  historyCardTextDisabled: {
    opacity: 0.5,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.md,
    alignItems: 'stretch',
    ...Shadows.medium,
  },
  footerButtonLeft: {
    flex: 1,
  },
  footerButtonRight: {
    flex: 1,
  },
});
