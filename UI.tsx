import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View, ViewStyle, TextStyle } from 'react-native';
import { C } from '@/lib/theme';

export function Label({ children, style }: {children: React.ReactNode; style?: TextStyle}) {
  return <Text style={[{ color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 7 }, style]}>{children}</Text>;
}
export function Field(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput placeholderTextColor={C.muted} {...props} style={[{
    backgroundColor: C.panel, color: C.text, borderColor: C.border, borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 13, fontSize: 15
  }, props.style]} />;
}
export function Button({ title, onPress, secondary, disabled, style }: {
  title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; style?: ViewStyle
}) {
  return <Pressable disabled={disabled} onPress={onPress} style={[{
    backgroundColor: secondary ? C.panel : C.red, borderColor: secondary ? C.border : C.red,
    borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginVertical: 5,
    opacity: disabled ? .55 : 1
  }, style]}>
    <Text style={{ color: C.text, fontWeight: '800' }}>{title}</Text>
  </Pressable>;
}
export function Busy() { return <View style={{ padding: 30 }}><ActivityIndicator color={C.red} size="large" /></View>; }
export function Empty({ title, detail }: {title: string; detail: string}) {
  return <View style={{ padding: 24, alignItems: 'center' }}><Text style={{ color: C.text, fontSize: 17, fontWeight: '800' }}>{title}</Text><Text style={{ color: C.muted, textAlign: 'center', marginTop: 8 }}>{detail}</Text></View>;
}
