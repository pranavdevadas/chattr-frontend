import { View, Text, KeyboardTypeOptions, ViewStyle } from 'react-native';
import React from 'react';
import { TextInput } from 'react-native-paper';

type TextInputComponentProps = {
  label: string;
  header?: string;
  value?: string;
  validationErr?: string;
  keyboardType?: KeyboardTypeOptions;
  onchangeText?: (text: string) => void;
};

const InputTextComponent: React.FC<TextInputComponentProps> = ({
  label,
  header,
  value,
  validationErr,
  keyboardType,
  onchangeText,
}) => {
  return (
    <View className="mb-4">
      <Text className="font-soraBold mb-1 ml-2 text-primarydark">{header}</Text>
      <TextInput
        label={label}
        mode="outlined"
        keyboardType={keyboardType}
        style={{ backgroundColor: 'transparent' } as ViewStyle}
        value={value}
        onChangeText={onchangeText}
        theme={{
          roundness: 50,
        }}
        outlineStyle={{ borderWidth: 2, borderColor: '#00000060' } as ViewStyle}
      />
      <Text
        className="text-sora text-sm ml-4"
        style={{ color: '#ff0000ff' } as ViewStyle}
      >
        {validationErr}
      </Text>
    </View>
  );
};

export default InputTextComponent;
