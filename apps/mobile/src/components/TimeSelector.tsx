import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import { TIME_OF_DAY_OPTIONS, type TimeType, type TimeOfDayOption } from '../types';

type TimeSelectorProps = {
  timeType: TimeType;
  selectedTime: Date | null;
  timeOfDayOption: TimeOfDayOption | null;
  onTimeTypeChange: (type: TimeType) => void;
  onTimeChange: (time: Date) => void;
  onTimeOfDayChange: (option: TimeOfDayOption) => void;
};

/**
 * TimeSelector Component
 * Step 3 of Post Game Flow
 * Three modes: Now, Time of Day, Precise Time
 */
export const TimeSelector: React.FC<TimeSelectorProps> = ({
  timeType,
  selectedTime,
  timeOfDayOption,
  onTimeTypeChange,
  onTimeChange,
  onTimeOfDayChange,
}) => {
  // For precise time slider
  const [sliderValue, setSliderValue] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every 30 seconds to keep slider accurate
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate time range for precise mode (45 minutes from now to 11 PM, rounded to nearest 15-min mark)
  const now = currentTime;
  
  // Round up to next 15-minute mark after adding 45 minutes
  const minTimeRaw = new Date(now.getTime() + 45 * 60 * 1000);
  const minTime = new Date(minTimeRaw);
  const minutes = minTime.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  minTime.setMinutes(roundedMinutes, 0, 0);
  
  // If rounding pushed us to next hour
  if (roundedMinutes >= 60) {
    minTime.setHours(minTime.getHours() + 1, 0, 0, 0);
  }
  
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 0, 0, 0); // 11 PM
  
  // If end of day is before min time, set end of day to tomorrow at 11 PM
  if (endOfDay <= minTime) {
    endOfDay.setDate(endOfDay.getDate() + 1);
  }
  
  const maxMinutesFromMin = Math.floor((endOfDay.getTime() - minTime.getTime()) / (1000 * 60));
  
  // Auto-update selected time if it's too close to now
  React.useEffect(() => {
    if (timeType === 'precise' && selectedTime) {
      const timeDiff = selectedTime.getTime() - now.getTime();
      if (timeDiff < 45 * 60 * 1000) {
        // Selected time is less than 45 minutes away, update it
        const newSliderValue = 0; // Reset to minimum
        setSliderValue(newSliderValue);
        onTimeChange(minTime);
      }
    }
  }, [currentTime, timeType]);
  
  const handlePreciseTimeChange = (minutes: number) => {
    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(minutes / 15) * 15;
    setSliderValue(roundedMinutes);
    
    // Calculate the new time
    const newTime = new Date(minTime.getTime() + roundedMinutes * 60 * 1000);
    
    // Ensure it lands on :00, :15, :30, or :45
    const mins = newTime.getMinutes();
    const roundedMins = Math.round(mins / 15) * 15;
    newTime.setMinutes(roundedMins % 60, 0, 0);
    if (roundedMins >= 60) {
      newTime.setHours(newTime.getHours() + 1);
    }
    
    onTimeChange(newTime);
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatRelativeTime = (minutes: number): string => {
    if (!selectedTime) return 'Select a time';
    const diffMs = selectedTime.getTime() - now.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (totalMinutes < 60) return `In ${totalMinutes} minutes`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (mins === 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    return `In ${hours}h ${mins}m`;
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>When to Play?</Text>
      <Text style={styles.subtitle}>Choose when the game should start</Text>

      {/* Time Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, timeType === 'time_of_day' && styles.modeButtonActive]}
          onPress={() => onTimeTypeChange('time_of_day')}
        >
          <Text style={[styles.modeIcon, timeType === 'time_of_day' && styles.modeIconActive]}>🌅</Text>
          <Text style={[styles.modeText, timeType === 'time_of_day' && styles.modeTextActive]}>
            Time of Day
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, timeType === 'precise' && styles.modeButtonActive]}
          onPress={() => onTimeTypeChange('precise')}
        >
          <Text style={[styles.modeIcon, timeType === 'precise' && styles.modeIconActive]}>🕐</Text>
          <Text style={[styles.modeText, timeType === 'precise' && styles.modeTextActive]}>
            Choose Time
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.minimumNotice}>
        <Text style={styles.minimumNoticeText}>
          ⏱️ Games must be scheduled at least 45 minutes in advance
        </Text>
      </View>

      {/* Mode Content */}
      <View style={styles.modeContent}>

        {/* TIME OF DAY Mode */}
        {timeType === 'time_of_day' && (
          <View style={styles.timeOfDayContainer}>
            {(Object.keys(TIME_OF_DAY_OPTIONS) as TimeOfDayOption[]).map((option) => {
              const { label, hour } = TIME_OF_DAY_OPTIONS[option];
              const isSelected = timeOfDayOption === option;
              const optionTime = new Date();
              
              // Handle "tomorrow morning" case
              if (option === 'tomorrow_morning') {
                optionTime.setDate(optionTime.getDate() + 1);
                optionTime.setHours(hour, 0, 0, 0);
              } else {
                optionTime.setHours(hour, 0, 0, 0);
              }
              
              // Check if this time is at least 45 minutes from now
              const minAllowedTime = new Date(now.getTime() + 45 * 60 * 1000);
              const isDisabled = optionTime < minAllowedTime;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.timeOfDayOption, 
                    isSelected && styles.timeOfDayOptionActive,
                    isDisabled && styles.timeOfDayOptionDisabled
                  ]}
                  onPress={() => {
                    if (!isDisabled) {
                      onTimeOfDayChange(option);
                      onTimeChange(optionTime);
                    }
                  }}
                  disabled={isDisabled}
                >
                  <Text style={[
                    styles.timeOfDayLabel, 
                    isSelected && styles.timeOfDayLabelActive,
                    isDisabled && styles.timeOfDayLabelDisabled
                  ]}>
                    {label} {isDisabled && '(too soon)'}
                  </Text>
                  <Text style={[
                    styles.timeOfDayTime, 
                    isSelected && styles.timeOfDayTimeActive,
                    isDisabled && styles.timeOfDayTimeDisabled
                  ]}>
                    {formatTime(optionTime)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* PRECISE Time Mode */}
        {timeType === 'precise' && (
          <View style={styles.preciseContainer}>
            <View style={styles.preciseDisplay}>
              <Text style={styles.preciseLabel}>Selected Time</Text>
              <Text style={styles.preciseTime}>
                {selectedTime ? formatTime(selectedTime) : formatTime(now)}
              </Text>
              <Text style={styles.preciseRelative}>
                {formatRelativeTime(Math.round(sliderValue))}
              </Text>
            </View>

            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={maxMinutesFromMin}
                value={sliderValue}
                onValueChange={handlePreciseTimeChange}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.primary}
                step={15} // 15-minute intervals
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>{formatTime(minTime)}</Text>
                <Text style={styles.sliderLabel}>11:00 PM</Text>
              </View>
            </View>

            <View style={styles.helperBox}>
              <Text style={styles.helperText}>
                💡 Drag the slider to set a precise time (15-minute intervals)
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  // Mode Selector
  modeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.medium,
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  modeIconActive: {
    // Icon stays the same
  },
  modeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  modeTextActive: {
    color: Colors.textInverse,
  },
  // Mode Content
  modeContent: {
    minHeight: 200,
  },
  // NOW Mode
  nowContainer: {
    alignItems: 'center',
  },
  nowCard: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.large,
  },
  nowIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  nowTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.sm,
  },
  nowDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: Spacing.lg,
  },
  timeDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  timeDisplayText: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  // TIME OF DAY Mode
  timeOfDayContainer: {
    gap: Spacing.sm,
  },
  timeOfDayOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  timeOfDayOptionActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    ...Shadows.small,
  },
  timeOfDayLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  timeOfDayLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  timeOfDayTime: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  timeOfDayTimeActive: {
    color: Colors.primary,
  },
  timeOfDayOptionDisabled: {
    opacity: 0.5,
  },
  timeOfDayLabelDisabled: {
    color: Colors.textTertiary,
  },
  timeOfDayTimeDisabled: {
    color: Colors.textTertiary,
  },
  minimumNotice: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  minimumNoticeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // PRECISE Time Mode
  preciseContainer: {
    gap: Spacing.md,
  },
  preciseDisplay: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  preciseLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  preciseTime: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  preciseRelative: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  sliderContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  sliderLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  helperBox: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});

