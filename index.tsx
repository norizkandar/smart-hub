import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View, Pressable } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { C } from '@/lib/theme';
import { Vehicle } from '@/types';
import CarCard from '@/components/CarCard';
import { Busy, Button, Empty } from '@/components/UI';

export default function Home() {
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string[]>([]);
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vehicles').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(30);
    if (error && isSupabaseConfigured) Alert.alert('Could not load listings', error.message);
    setCars((data || []) as Vehicle[]);
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: favs } = await supabase.from('favorites').select('vehicle_id').eq('user_id', userData.user.id);
      setSaved((favs || []).map((f: any) => f.vehicle_id));
    }
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const toggle = async (id: string) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return Alert.alert('Log in required', 'Log in to save favorites.', [{ text: 'Cancel' }, { text: 'Log in', onPress: () => router.push('/auth') }]);
    if (saved.includes(id)) {
      const { error } = await supabase.from('favorites').delete().eq('vehicle_id', id).eq('user_id', data.user.id);
      if (!error) setSaved(s => s.filter(x => x !== id));
    } else {
      const { error } = await supabase.from('favorites').insert({ vehicle_id: id, user_id: data.user.id });
      if (!error) setSaved(s => [...s, id]); else Alert.alert('Unable to save', error.message);
    }
  };
  return <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 18 }}>
    <Text style={{ color: C.red, fontWeight: '900', letterSpacing: 3, fontSize: 12 }}>BY EONIX TECH STUDIO</Text>
    <Text style={{ color: C.text, fontSize: 31, fontWeight: '900', marginTop: 8 }}>FIND YOUR{'\n'}NEXT DRIVE.</Text>
    <Text style={{ color: C.muted, fontSize: 15, lineHeight: 22, marginTop: 9 }}>Discover quality cars. Compare your options. Drive with confidence.</Text>
    {!isSupabaseConfigured && <View style={{ backgroundColor: '#352020', padding: 12, borderRadius: 10, marginTop: 14 }}><Text style={{ color: '#FFD7D7' }}>Connect Supabase in your .env file to load real listings and enable accounts.</Text></View>}
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
      <View style={{ flex: 1 }}><Button title="Explore cars" onPress={() => router.push('/(tabs)/search')} /></View>
      <View style={{ flex: 1 }}><Button title="Sell your car" secondary onPress={() => router.push('/sell')} /></View>
    </View>
    <View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}>
      {['SUVs', 'Sedans', 'Hatchbacks', 'EVs'].map(x => <Pressable key={x} onPress={() => router.push({ pathname: '/(tabs)/search', params: { body: x === 'EVs' ? 'Electric' : x } })} style={{ backgroundColor: C.panel, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9 }}><Text style={{ color: C.text }}>{x}</Text></Pressable>)}
    </View>
    <Text style={{ color: C.text, fontWeight: '900', fontSize: 21, marginTop: 15, marginBottom: 12 }}>Latest listings</Text>
    {loading ? <Busy /> : cars.length ? cars.map(car => <CarCard key={car.id} car={car} favorite={saved.includes(car.id)} onFavorite={() => toggle(car.id)} />) : <Empty title="No cars listed yet" detail="Published vehicles will appear here after a seller adds a listing and it is approved." />}
    <Button title="Estimate monthly repayment" secondary onPress={() => router.push('/calculator')} />
  </ScrollView>;
}