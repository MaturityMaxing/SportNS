import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

type MultiRangeSliderProps = {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  step?: number;
  onValuesChange: (minVal: number, maxVal: number) => void;
  minLabel?: string;
  maxLabel?: string;
  formatValue?: (value: number) => string;
};

/**
 * MultiRangeSlider Component
 * A single slider with two thumbs for selecting a range
 * Uses @ptomasroos/react-native-multi-slider for reliable dual-thumb interaction
 */
export const MultiRangeSlider: React.FC<MultiRangeSliderProps> = ({
  min,
  max,
  minValue,
  maxValue,
  step = 1,
  onValuesChange,
  minLabel = 'Min',
  maxLabel = 'Max',
  formatValue = (val) => val.toString(),
}) => {
  const handleValuesChange = (values: number[]) => {
    onValuesChange(values[0], values[1]);
  };

  return (
    <View style={styles.container}>
      {/* Labels and Values */}
      <View style={styles.labelsRow}>
        <View style={styles.labelContainer}>
          <Text style={styles.labelTitle}>{minLabel}</Text>
          <View style={styles.valueBox}>
            <Text style={styles.valueText}>{formatValue(minValue)}</Text>
          </View>
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.labelTitle}>{maxLabel}</Text>
          <View style={[styles.valueBox, styles.valueBoxMax]}>
            <Text style={styles.valueText}>{formatValue(maxValue)}</Text>
          </View>
        </View>
      </View>

      {/* Range Slider */}
      <View style={styles.sliderContainer}>
        <MultiSlider
          values={[minValue, maxValue]}
          min={min}
          max={max}
          step={step}
          onValuesChange={handleValuesChange}
          selectedStyle={styles.selectedTrack}
          unselectedStyle={styles.unselectedTrack}
          markerStyle={styles.marker}
          pressedMarkerStyle={styles.markerPressed}
          containerStyle={styles.multiSliderContainer}
          trackStyle={styles.track}
          sliderLength={280}
          enableLabel={false}
          allowOverlap={true}
          snapped
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  labelTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  valueBox: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 36,
    alignItems: 'center',
  },
  valueBoxMax: {
    backgroundColor: Colors.primaryLight,
  },
  valueText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  sliderContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiSliderContainer: {
    alignItems: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  selectedTrack: {
    backgroundColor: Colors.primary,
  },
  unselectedTrack: {
    backgroundColor: Colors.border,
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerPressed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
});
