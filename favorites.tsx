import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { C } from '@/lib/theme';
import { Vehicle } from '@/types';
import CarCard from '@/components/CarCard';
import { Button, Empty, Busy } from '@/components/UI';
export default function Favorites() {
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setCars([]); setLoading(false); return; }
    const { data, error } = await supabase.from('favorites').select('vehicle:vehicles(*)').eq('user_id', u.user.id);
    if (error) Alert.alert('Unable to load favorites', error.message);
    setCars((data || []).map((x: any) => x.vehicle).filter(Boolean) as Vehicle[]);
    setLoading(false);
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  const remove = async (id: string) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from('favorites').delete().eq('vehicle_id', id).eq('user_id', u.user.id);
    if (error) Alert.alert('Unable to remove', error.message); else setCars(c => c.filter(x => x.id !== id));
  };
  return <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
    <Text style={{ color: C.text, fontSize: 24, fontWeight: '900', marginBottom: 14 }}>Saved cars</Text>
    <Button title="Log in / create account" secondary onPress={() => router.push('/auth')} />
    {loading ? <Busy /> : cars.length ? cars.map(car => <CarCard key={car.id} car={car} favorite onFavorite={() => remove(car.id)} />) : <Empty title="Nothing saved yet" detail="Log in and save vehicles to keep them here." />}
  </ScrollView>;
}