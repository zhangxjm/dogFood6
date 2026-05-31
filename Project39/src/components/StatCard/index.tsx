import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit }) => {
  return (
    <View className={styles.card}>
      <Text className={styles.value}>
        {value}
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </Text>
      <Text className={styles.label}>{label}</Text>
    </View>
  );
};

export default StatCard;
