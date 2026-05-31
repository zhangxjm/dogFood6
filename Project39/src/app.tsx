import React from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';

const App: React.FC = (props) => {
  useDidShow(() => {});
  useDidHide(() => {});
  return <>{props.children}</>;
};

export default App;
