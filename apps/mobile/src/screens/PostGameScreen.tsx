import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SportSelector, PlayersAndSkillStep, TimeSelector, Button } from '../components';
import { Colors, Spacing, Typography } from '../theme';
import { getSports } from '../services/games';
import type { Sport, SkillLevel, TimeType, TimeOfDayOption } from '../types';
import { SKILL_LEVELS } from '../types';

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

  // Form data state - Step 1
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  
  // Form data state - Step 2
  const [minPlayers, setMinPlayers] = useState<number>(2);
  const [maxPlayers, setMaxPlayers] = useState<number>(10);
  const [minSkillLevel, setMinSkillLevel] = useState<SkillLevel>(SKILL_LEVELS[0]);
  const [maxSkillLevel, setMaxSkillLevel] = useState<SkillLevel>(SKILL_LEVELS[4]);
  
  // Form data state - Step 3
  const [timeType, setTimeType] = useState<TimeType>('now');
  const [selectedTime, setSelectedTime] = useState<Date | null>(new Date());
  const [timeOfDayOption, setTimeOfDayOption] = useState<TimeOfDayOption | null>(null);

  // Load sports data
  useEffect(() => {
    loadSports();
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

  const loadSports = async () => {
    try {
      setLoading(true);
      const data = await getSports();
      setSports(data);
    } catch (error) {
      console.error('Error loading sports:', error);
      Alert.alert('Error', 'Failed to load sports. Please try again.');
    } finally {
      setLoading(false);
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

  const handleSubmit = () => {
    // TODO: Day 8 - Implement actual game posting
    Alert.alert(
      'Coming Soon',
      'Game posting functionality will be implemented in Day 8!\n\n' +
      'Your selections:\n' +
      `• Sport: ${sports.find(s => s.id === selectedSportId)?.name}\n` +
      `• Players: ${minPlayers}-${maxPlayers}\n` +
      `• Skill: ${minSkillLevel} to ${maxSkillLevel}\n` +
      `• Time: ${timeType}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
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
            minSkillLevel={minSkillLevel}
            maxSkillLevel={maxSkillLevel}
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
          />
          <Button
            title={currentStep === 3 ? 'Post Game' : 'Next'}
            onPress={handleNext}
            style={styles.footerButton}
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
});
