import {
  DeviceInfo,
  Platform,
} from 'react-native';

export const CARD_RATIO = 7.0 / 5.0;

export const NOTCH_BOTTOM_PADDING = DeviceInfo.isIPhoneX_deprecated ? 20 : 0;
export const HEADER_HEIGHT = Platform.OS === 'ios' ? 64 : 80;
export const TABBAR_HEIGHT = (Platform.OS === 'ios' ? 64 : 80) + NOTCH_BOTTOM_PADDING;
