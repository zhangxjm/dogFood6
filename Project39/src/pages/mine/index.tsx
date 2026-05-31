import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { MONTHLY_STATS } from '@/data/members';
import { LEVEL_MAP } from '@/types';
import styles from './index.module.scss';

const MENU_ITEMS = [
  { key: 'appointments', label: '我的预约', url: '/pages/order/index' },
  { key: 'recharge', label: '余额充值' },
  { key: 'feedback', label: '意见反馈' },
  { key: 'about', label: '关于我们' },
];

const MinePage: React.FC = () => {
  const { currentMember } = useAppStore();

  const maxAmount = Math.max(...MONTHLY_STATS.map((s) => s.amount));

  const menuClick = (item: typeof MENU_ITEMS[0]) => {
    if (item.url) {
      Taro.switchTab({ url: item.url });
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.profileHeader}>
        <Image
          className={styles.avatar}
          src={currentMember.avatar}
          mode="aspectFill"
        />
        <View className={styles.profileInfo}>
          <Text className={styles.memberName}>{currentMember.name}</Text>
          <View className={styles.levelBadge}>
            <Text className={styles.levelText}>
              {LEVEL_MAP[currentMember.level]}
            </Text>
          </View>
          <Text className={styles.phoneText}>{currentMember.phone}</Text>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {currentMember.totalSpent}
              <Text className={styles.statUnit}>元</Text>
            </Text>
            <Text className={styles.statLabel}>累计消费</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {currentMember.visitCount}
              <Text className={styles.statUnit}>次</Text>
            </Text>
            <Text className={styles.statLabel}>到店次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {currentMember.balance}
              <Text className={styles.statUnit}>元</Text>
            </Text>
            <Text className={styles.statLabel}>账户余额</Text>
          </View>
        </View>
      </View>

      <View className={styles.chartSection}>
        <Text className={styles.chartTitle}>月度消费趋势</Text>
        <View className={styles.chartContainer}>
          {MONTHLY_STATS.map((stat) => {
            const height = maxAmount > 0 ? (stat.amount / maxAmount) * 240 : 0;
            return (
              <View className={styles.barItem} key={stat.month}>
                <Text className={styles.barAmount}>¥{stat.amount}</Text>
                <View
                  className={styles.bar}
                  style={{ height: `${height}rpx` }}
                />
                <Text className={styles.barLabel}>
                  {stat.month.slice(5)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.menuSection}>
        {MENU_ITEMS.map((item) => (
          <View
            key={item.key}
            className={styles.menuItem}
            onClick={() => menuClick(item)}
          >
            <View className={styles.menuItemLeft}>
              <Text className={styles.menuItemText}>{item.label}</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MinePage;
