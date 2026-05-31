import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import type { SpaService } from '@/types';
import styles from './index.module.scss';

interface ServiceCardProps {
  service: SpaService;
  onBook?: (service: SpaService) => void;
  onClick?: (service: SpaService) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook, onClick }) => {
  const handleCardClick = () => {
    onClick?.(service);
  };

  const handleBookClick = (e: any) => {
    e.stopPropagation();
    onBook?.(service);
  };

  return (
    <View className={styles.card} onClick={handleCardClick}>
      <Image
        className={styles.image}
        src={service.image}
        mode="aspectFill"
      />
      <View className={styles.info}>
        <View className={styles.header}>
          <Text className={styles.name}>{service.name}</Text>
          <View className={styles.tag}>
            <Text className={styles.tagText}>{service.category}</Text>
          </View>
        </View>
        <Text className={styles.desc}>{service.description}</Text>
        <View className={styles.footer}>
          <View className={styles.priceRow}>
            <Text className={styles.priceSymbol}>¥</Text>
            <Text className={styles.price}>{service.price}</Text>
            <Text className={styles.duration}>{service.duration}分钟</Text>
          </View>
          <View className={styles.bookBtn} onClick={handleBookClick}>
            <Text className={styles.bookBtnText}>预约</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ServiceCard;
