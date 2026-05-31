import React from 'react';
import { View, Text } from '@tarojs/components';
import type { Appointment } from '@/types';
import { STATUS_MAP, STATUS_COLOR_MAP } from '@/types';
import styles from './index.module.scss';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: number) => void;
  onClick?: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  onClick,
}) => {
  const statusLabel = STATUS_MAP[appointment.status];
  const statusColor = STATUS_COLOR_MAP[appointment.status];

  return (
    <View className={styles.card} onClick={() => onClick?.(appointment)}>
      <View className={styles.header}>
        <Text className={styles.serviceName}>{appointment.serviceName}</Text>
        <View className={styles.statusBadge} style={{ backgroundColor: statusColor }}>
          <Text className={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>
      <View className={styles.body}>
        <View className={styles.row}>
          <Text className={styles.label}>预约时间</Text>
          <Text className={styles.value}>{appointment.appointmentTime}</Text>
        </View>
        {appointment.duration > 0 && (
          <View className={styles.row}>
            <Text className={styles.label}>服务时长</Text>
            <Text className={styles.value}>{appointment.duration}分钟</Text>
          </View>
        )}
        <View className={styles.row}>
          <Text className={styles.label}>服务金额</Text>
          <Text className={styles.priceValue}>¥{appointment.amount}</Text>
        </View>
        {appointment.note && (
          <View className={styles.row}>
            <Text className={styles.label}>备注</Text>
            <Text className={styles.value}>{appointment.note}</Text>
          </View>
        )}
      </View>
      {appointment.status === 'pending' && onCancel && (
        <View className={styles.footer}>
          <View
            className={styles.cancelBtn}
            onClick={(e) => {
              e.stopPropagation();
              onCancel(appointment.id);
            }}
          >
            <Text className={styles.cancelBtnText}>取消预约</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default AppointmentCard;
