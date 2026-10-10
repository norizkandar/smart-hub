import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Vehicle } from '@/types';
import { C } from '@/lib/theme';
import { money, km } from '@/lib/format';
export default function CarCard({ car, favorite, onFavorite, onCompare, comparing }: {
  car: Vehicle; favorite?: boolean; onFavorite?: () => void; onCompare?: () => void; comparing?: boolean
}) {
  const image = car.image_urls?.[0];
  return <Pressable onPress={() => router.push(`/car/${car.id}`)} style={{ backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
    {image ? <Image source={{ uri: image }} style={{ width: '100%', height: 185, backgroundColor: C.panel }} resizeMode="cover" /> :
      <View style={{ height: 150, backgroundColor: C.panel, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.muted, fontSize: 36 }}>🚘</Text><Text style={{ color: C.muted }}>No vehicle photo</Text></View>}
    <View style={{ padding: 14 }}>
      <Text style={{ color: C.red, fontWeight: '900', fontSize: 19 }}>{money(car.price)}</Text>
      <Text style={{ color: C.text, fontWeight: '800', fontSize: 16, marginTop: 5 }}>{car.year} {car.make} {car.model}</Text>
      {!!car.variant && <Text style={{ color: C.muted, marginTop: 3 }}>{car.variant}</Text>}
      <Text style={{ color: C.muted, marginTop: 8 }}>{km(car.mileage_km)} · {car.transmission || 'Transmission n/a'} · {car.fuel_type || 'Fuel n/a'}</Text>
      <Text style={{ color: C.muted, marginTop: 5 }}>📍 {car.location || 'Location not set'}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        {onFavorite && <Pressable onPress={onFavorite} style={{ padding: 9, borderRadius: 9, backgroundColor: C.panel }}><Text style={{ color: C.text }}>{favorite ? '♥ Saved' : '♡ Save'}</Text></Pressable>}
        {onCompare && <Pressable onPress={onCompare} style={{ padding: 9, borderRadius: 9, backgroundColor: C.panel }}><Text style={{ color: C.text }}>{comparing ? '✓ Compare' : '+ Compare'}</Text></Pressable>}
      </View>
    </View>
  </Pressable>;
}