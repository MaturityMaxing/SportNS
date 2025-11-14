import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Alert, BackHandler, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SportSelector, PlayersAndSkillStep, TimeSelector, Button } from '../components';
import { Colors, Spacing, Typography } from '../theme';
import { getSports, createGameEvent, getUserGameHistory } from '../services/games';
import { getCurrentUser } from '../services/auth';
import type { Sport, SkillLevel, TimeType, TimeOfDayOption, GameEventWithDetails } from '../types';
import { SKILL_LEVELS, TIME_OF_DAY_OPTIONS, SKILL_LEVEL_LABELS } from '../types';

/**
 * PostGameScreen
 * Multi-step form for posting a new game
 * Day 6-7: Implements all 3 steps:
 *   Step 1: Sport Selection
 *   Step 2: Players & Skill (merged from old steps 2 and 3)
 *   Step 3: Time Selection
 */
export const PostGameScreen: React.FC = () => {
  const navigation = useNavigation();
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
  
  // Form data state - Step 3
  const [timeType, setTimeType] = useState<TimeType>('now');
  const [selectedTime, setSelectedTime] = useState<Date | null>(new Date());
  const [timeOfDayOption, setTimeOfDayOption] = useState<TimeOfDayOption | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Android back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentStep > 1) {
        // Go back one step instead of exiting
        setCurrentStep(currentStep - 1);
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior (exit screen)
    });

    return () => backHandler.remove();
  }, [currentStep]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load user
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
      } else {
        Alert.alert('Error', 'You must be logged in to post a game.');
        navigation.goBack();
        return;
      }

      // Load sports
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
      setHistoryExpanded(true);
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
    // Auto-advance to next step after a brief delay for visual feedback
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  };

  // Handle time type change
  const handleTimeTypeChange = (type: TimeType) => {
    setTimeType(type);
    if (type === 'now') {
      setSelectedTime(new Date());
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
      // Final step - validate and submit
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
    // Only allow clicking on completed steps or current step
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

      // Prepare game event data
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

      // Create game event (also auto-joins creator)
      const gameId = await createGameEvent(gameData);

      console.log('Game created successfully:', gameId);

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
      Alert.alert(
        'Error',
        'Failed to post game. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrefillFromHistory = (game: GameEventWithDetails) => {
    // Prefill form with data from previous game
    setSelectedSportId(game.sport_id);
    setMinPlayers(game.min_players);
    setMaxPlayers(game.max_players);
    setSkillRestrictionEnabled(game.skill_level_min !== null && game.skill_level_max !== null);
    setMinSkillLevel(game.skill_level_min || SKILL_LEVELS[0]);
    setMaxSkillLevel(game.skill_level_max || SKILL_LEVELS[4]);
    setTimeType(game.time_type);
    
    // Don't copy the exact time, but keep the time type
    if (game.time_type === 'now') {
      setSelectedTime(new Date());
    } else if (game.time_type === 'time_of_day' && game.time_label) {
      // Find matching time of day option
      const option = Object.entries(TIME_OF_DAY_OPTIONS).find(
        ([_, value]) => value.label === game.time_label
      )?.[0] as TimeOfDayOption | undefined;
      
      if (option) {
        setTimeOfDayOption(option);
        const now = new Date();
        const optionData = TIME_OF_DAY_OPTIONS[option];
        const scheduledTime = new Date(now);
        scheduledTime.setHours(optionData.hour, 0, 0, 0);
        
        // If the time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        setSelectedTime(scheduledTime);
      }
    }

    // Go to step 1 to review
    setCurrentStep(1);
    setHistoryExpanded(false);

    Alert.alert(
      'Pre-filled',
      `Form has been filled with data from your previous ${game.sport?.name} game.`
    );
  };

  // Render history section
  const renderHistory = () => {
    if (currentStep !== 1 || loading) return null;

    return (
      <View style={styles.historyContainer}>
        <TouchableOpacity
          style={styles.historyHeader}
          onPress={() => {
            if (historyExpanded) {
              setHistoryExpanded(false);
            } else {
              if (gameHistory.length === 0) {
                loadHistory();
              } else {
                setHistoryExpanded(true);
              }
            }
          }}
        >
          <Text style={styles.historyTitle}>
            {historyExpanded ? '▼' : '▶'} Previous Posts
          </Text>
          <Text style={styles.historySubtitle}>
            Tap to {historyExpanded ? 'hide' : 'view'} and quick-post
          </Text>
        </TouchableOpacity>

        {historyExpanded && (
          <View style={styles.historyContent}>
            {historyLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} style={styles.historyLoader} />
            ) : gameHistory.length === 0 ? (
              <Text style={styles.historyEmpty}>No previous posts found.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
                {gameHistory.map((game) => (
                  <TouchableOpacity
                    key={game.id}
                    style={styles.historyCard}
                    onPress={() => handlePrefillFromHistory(game)}
                  >
                    <Text style={styles.historyCardSport}>{game.sport?.name}</Text>
                    <Text style={styles.historyCardDetail}>
                      {game.min_players}-{game.max_players} players
                    </Text>
                    {game.skill_level_min && game.skill_level_max && (
                      <Text style={styles.historyCardDetail}>
                        {SKILL_LEVEL_LABELS[game.skill_level_min]} - {SKILL_LEVEL_LABELS[game.skill_level_max]}
                      </Text>
                    )}
                    <Text style={styles.historyCardTime}>
                      {game.time_type === 'now' ? 'Now' : game.time_label || game.time_type}
                    </Text>
                  </TouchableOpacity>
                ))}
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
      { number: 2, label: 'Players', canNavigate: selectedSportId !== null },
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
            >
              <View
                style={[
                  styles.stepCircle,
                  step.number === currentStep && styles.stepCircleActive,
                  step.number < currentStep && styles.stepCircleCompleted,
                  !step.canNavigate && styles.stepCircleDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (step.number === currentStep || step.number < currentStep) &&
                      styles.stepNumberActive,
                  ]}
                >
                  {step.number}
                </Text>
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
            skillRestrictionEnabled={skillRestrictionEnabled}
            minSkillLevel={minSkillLevel}
            maxSkillLevel={maxSkillLevel}
            onSkillRestrictionChange={setSkillRestrictionEnabled}
            onMinSkillLevelChange={setMinSkillLevel}
            onMaxSkillLevelChange={setMaxSkillLevel}
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with step indicator */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Game</Text>
        <View style={styles.headerSpacer} />
      </View>

      {renderStepIndicator()}

      {/* History section - only on step 1 */}
      {renderHistory()}

      {/* Step content */}
      <View style={styles.content}>{renderStepContent()}</View>

      {/* Navigation buttons - only show if not on step 1 (step 1 auto-advances) */}
      {currentStep > 1 && !loading && (
        <View style={styles.footer}>
          <Button
            title="Back"
            onPress={handleBack}
            variant="outline"
            style={styles.footerButton}
            disabled={submitting}
          />
          <Button
            title={currentStep === 3 ? (submitting ? 'Posting...' : 'Post Game') : 'Next'}
            onPress={handleNext}
            style={styles.footerButton}
            disabled={submitting}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  backButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  headerSpacer: {
    width: 60,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background,
  },
  stepItem: {
    alignItems: 'center',
    flex: 0,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepCircleDisabled: {
    opacity: 0.5,
  },
  stepNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  stepNumberActive: {
    color: Colors.textInverse,
  },
  stepLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  stepLabelDisabled: {
    opacity: 0.5,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
    marginBottom: 18,
  },
  stepLineCompleted: {
    backgroundColor: Colors.success,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  historyContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyHeader: {
    padding: Spacing.md,
  },
  historyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  historySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  historyContent: {
    paddingBottom: Spacing.md,
  },
  historyLoader: {
    paddingVertical: Spacing.lg,
  },
  historyEmpty: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  historyScroll: {
    paddingLeft: Spacing.md,
  },
  historyCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    width: 150,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyCardSport: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  historyCardDetail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  historyCardTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.xs,
  },
});
