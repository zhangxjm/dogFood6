import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '19:00', '19:30',
  '20:00', '20:30'
];

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const AppointmentPage: React.FC = () => {
  const { services, addAppointment } = useAppStore();
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const dates = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs().add(i, 'day');
      result.push({
        weekday: i === 0 ? '今天' : i === 1 ? '明天' : WEEKDAYS[d.day()],
        day: d.format('MM/DD'),
        fullDate: d.format('YYYY-MM-DD'),
      });
    }
    return result;
  }, []);

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  const canSubmit = selectedServiceId && selectedTime;

  const handleSubmit = () => {
    if (!canSubmit || !selectedService) return;

    const newAppointment = {
      id: Date.now(),
      memberId: 1,
      memberName: '张明华',
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      appointmentTime: `${dates[selectedDate].fullDate} ${selectedTime}`,
      status: 'pending' as const,
      duration: 0,
      amount: selectedService.price,
      note,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    };

    addAppointment(newAppointment);
    Taro.showToast({ title: '预约成功', icon: 'success' });
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/order/index' });
    }, 1500);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>预约服务</Text>
        <Text className={styles.subtitle}>选择心仪的服务，预约到店体验</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>选择服务</Text>
          <Text className={styles.requiredMark}>*</Text>
        </View>
        <ScrollView scrollX className={styles.serviceScroll}>
          <View className={styles.serviceScrollList}>
            {services.map((service) => (
              <View
                key={service.id}
                className={classnames(
                  styles.serviceChip,
                  selectedServiceId === service.id && styles.serviceChipActive
                )}
                onClick={() => setSelectedServiceId(service.id)}
              >
                <Text
                  className={classnames(
                    styles.serviceChipText,
                    selectedServiceId === service.id && styles.serviceChipTextActive
                  )}
                >
                  {service.name}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>选择日期</Text>
          <Text className={styles.requiredMark}>*</Text>
        </View>
        <ScrollView scrollX className={styles.dateScroll}>
          <View className={styles.dateList}>
            {dates.map((date, idx) => (
              <View
                key={date.fullDate}
                className={classnames(
                  styles.dateItem,
                  selectedDate === idx && styles.dateItemActive
                )}
                onClick={() => {
                  setSelectedDate(idx);
                  setSelectedTime(null);
                }}
              >
                <Text
                  className={classnames(
                    styles.dateWeekday,
                    selectedDate === idx && styles.dateWeekdayActive
                  )}
                >
                  {date.weekday}
                </Text>
                <Text
                  className={classnames(
                    styles.dateDay,
                    selectedDate === idx && styles.dateDayActive
                  )}
                >
                  {date.day}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>选择时段</Text>
          <Text className={styles.requiredMark}>*</Text>
        </View>
        <View className={styles.timeGrid}>
          {TIME_SLOTS.map((time) => (
            <View
              key={time}
              className={classnames(
                styles.timeItem,
                selectedTime === time && styles.timeItemActive
              )}
              onClick={() => setSelectedTime(time)}
            >
              <Text
                className={classnames(
                  styles.timeText,
                  selectedTime === time && styles.timeTextActive
                )}
              >
                {time}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>备注</Text>
        </View>
        <Input
          className={styles.noteInput}
          placeholder="请输入备注信息（选填）"
          value={note}
          onInput={(e) => setNote(e.detail.value)}
        />
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>合计</Text>
          <Text className={styles.priceSymbol}>¥</Text>
          <Text className={styles.priceValue}>
            {selectedService ? selectedService.price : '0'}
          </Text>
        </View>
        <View
          className={classnames(
            styles.submitBtn,
            !canSubmit && styles.submitBtnDisabled
          )}
          onClick={handleSubmit}
        >
          <Text className={styles.submitBtnText}>确认预约</Text>
        </View>
      </View>
    </View>
  );
};

export default AppointmentPage;
