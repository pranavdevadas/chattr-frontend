import { View, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import React from 'react';

type IconButtonProps = {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
};

const ButtonComponent: React.FC<IconButtonProps> = ({
  label,
  onPress,
  icon,
}) => {
  return (
    <View className="mt-4 self-center w-52 rounded-md overflow-hidden">
      <Button
        mode="contained"
        buttonColor="#5A0FC8"
        textColor="#fff"
        icon={() => icon}
        onPress={onPress}
        contentStyle={{ height: 53 } as ViewStyle}
        style={{ borderRadius: 50 } as ViewStyle}
      >
        {label}
      </Button>
    </View>
  );
};

export default ButtonComponent;
