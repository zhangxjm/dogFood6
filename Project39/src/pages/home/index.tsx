import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import ServiceCard from '@/components/ServiceCard';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORIES } from '@/data/services';
import type { SpaService } from '@/types';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { services, selectedCategory, setSelectedCategory } = useAppStore();

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const handleCategoryClick = (key: string) => {
    setSelectedCategory(key);
  };

  const handleServiceClick = (service: SpaService) => {
    Taro.navigateTo({
      url: `/pages/serviceDetail/index?id=${service.id}`,
    });
  };

  const handleBook = (service: SpaService) => {
    Taro.navigateTo({
      url: `/pages/createAppointment/index?serviceId=${service.id}`,
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.brand}>足浴养生会所</Text>
          <View className={styles.searchBar}>
            <Text className={styles.searchPlaceholder}>搜索服务项目</Text>
          </View>
        </View>
      </View>

      <View className={styles.bannerWrap}>
        <Image
          className={styles.bannerImage}
          src="https://picsum.photos/id/1015/750/320"
          mode="aspectFill"
        />
      </View>

      <ScrollView scrollX className={styles.categoryScroll}>
        <View className={styles.categoryList}>
          {CATEGORIES.map((cat) => (
            <View
              key={cat.key}
              className={classnames(
                styles.categoryItem,
                selectedCategory === cat.key && styles.categoryItemActive
              )}
              onClick={() => handleCategoryClick(cat.key)}
            >
              <Text
                className={classnames(
                  styles.categoryText,
                  selectedCategory === cat.key && styles.categoryTextActive
                )}
              >
                {cat.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          {selectedCategory === 'all' ? '全部服务' : selectedCategory}
        </Text>
      </View>

      <View className={styles.serviceList}>
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={handleServiceClick}
              onBook={handleBook}
            />
          ))
        ) : (
          <View className={styles.emptyTip}>
            <Text className={styles.emptyText}>暂无该分类服务</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HomePage;
