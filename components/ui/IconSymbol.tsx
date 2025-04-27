// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Octicons from '@expo/vector-icons/Octicons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

type IconMapping = {
  lib: React.ComponentType<any>;
  name: string;
};

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING: Record<string, IconMapping> = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': {
    lib: MaterialIcons,
    name: 'home',
  },
  'paperplane.fill': {
    lib: MaterialIcons,
    name: 'send',
  },
  'competition.fill': {
    lib: MaterialIcons,
    name: 'emoji-events',
  },
  'chevron.left.forwardslash.chevron.right': {
    lib: MaterialIcons,
    name: 'code',
  },
  'chevron.right': {
    lib: MaterialIcons,
    name: 'chevron-right',
  },
  
  // 新增AntDesign映射
  'user.fill': {
    lib: AntDesign,
    name: 'user',
  },
  // 新增AntDesign映射
  'shoppingcart.fill': {
    lib: AntDesign,
    name: 'shoppingcart',
  },

  // 新增Feather映射
  'camera.fill': {
    lib: Feather,
    name: 'camera',
  },

  // 新增Octicons映射
  'threebars.fill': {
    lib: Octicons,
    name: 'three-bars',
  }
};

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const mapping = MAPPING[name];
  if (!mapping) {
    console.error(`[IconSymbol] 图标名称 '${name}' 未在映射表中定义`);
    return null; // 或返回默认图标
  }

  const { lib: IconComponent, name: iconName } = MAPPING[name];
  
  return (
    <IconComponent
      name={iconName}
      size={size}
      color={color}
      style={style}
    />
  );
}
