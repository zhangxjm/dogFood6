import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import AppointmentCard from '@/components/AppointmentCard';
import { useAppStore } from '@/store/useAppStore';
import { STATUS_MAP } from '@/types';
import styles from './index.module.scss';

const FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已确认' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const OrderPage: React.FC = () => {
  const { appointments, updateAppointmentStatus } = useAppStore();
  const [filter, setFilter] = useState('all');

  const filteredAppointments = useMemo(() => {
    if (filter === 'all') return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const handleCancel = (id: number) => {
    Taro.showModal({
      title: '提示',
      content: '确认取消此预约？',
      success: (res) => {
        if (res.confirm) {
          updateAppointmentStatus(id, 'cancelled');
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>我的订单</Text>
      </View>

      <ScrollView scrollX className={styles.filterScroll}>
        <View className={styles.filterList}>
          {FILTER_OPTIONS.map((opt) => (
            <View
              key={opt.key}
              className={classnames(
                styles.filterItem,
                filter === opt.key && styles.filterItemActive
              )}
              onClick={() => setFilter(opt.key)}
            >
              <Text
                className={classnames(
                  styles.filterText,
                  filter === opt.key && styles.filterTextActive
                )}
              >
                {opt.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className={styles.orderList}>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              onCancel={handleCancel}
            />
          ))
        ) : (
          <View className={styles.emptyWrap}>
            <Text className={styles.emptyText}>暂无订单记录</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default OrderPage;
