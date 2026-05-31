import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const ServiceDetailPage: React.FC = () => {
  const { services } = useAppStore();

  const serviceId = useMemo(() => {
    const params = Taro.getCurrentInstance().router?.params;
    return params?.id ? Number(params.id) : null;
  }, []);

  const service = useMemo(() => {
    return services.find((s) => s.id === serviceId) || null;
  }, [services, serviceId]);

  if (!service) {
    return (
      <View className={styles.container}>
        <View className={styles.content}>
          <View className={styles.mainCard}>
            <Text className={styles.descText}>服务不存在</Text>
          </View>
        </View>
      </View>
    );
  }

  const handleBook = () => {
    Taro.navigateTo({
      url: `/pages/createAppointment/index?serviceId=${service.id}`,
    });
  };

  return (
    <View className={styles.container}>
      <Image
        className={styles.heroImage}
        src={service.image}
        mode="aspectFill"
      />

      <View className={styles.content}>
        <View className={styles.mainCard}>
          <Text className={styles.serviceName}>{service.name}</Text>
          <View className={styles.tagRow}>
            <View className={styles.categoryTag}>
              <Text className={styles.categoryTagText}>{service.category}</Text>
            </View>
            <View className={styles.durationTag}>
              <Text className={styles.durationTagText}>{service.duration}分钟</Text>
            </View>
          </View>
          <View className={styles.priceRow}>
            <Text className={styles.priceSymbol}>¥</Text>
            <Text className={styles.priceValue}>{service.price}</Text>
            <Text className={styles.priceUnit}>/次</Text>
          </View>
        </View>

        <View className={styles.descCard}>
          <Text className={styles.descTitle}>服务介绍</Text>
          <Text className={styles.descText}>{service.description}</Text>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.infoTitle}>服务信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>服务时长</Text>
            <Text className={styles.infoValue}>{service.duration}分钟</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>服务价格</Text>
            <Text className={styles.infoValue}>¥{service.price}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>服务分类</Text>
            <Text className={styles.infoValue}>{service.category}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>预约方式</Text>
            <Text className={styles.infoValue}>在线预约</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.bookBtn} onClick={handleBook}>
          <Text className={styles.bookBtnText}>立即预约</Text>
        </View>
      </View>
    </View>
  );
};

export default ServiceDetailPage;
