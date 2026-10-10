import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { C } from '@/lib/theme';
import { Button, Empty, Busy } from '@/components/UI';
export default function Messages() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setRows([]); setLoading(false); return; }
    const { data, error } = await supabase.from('enquiries').select('id, message, status, created_at, vehicle:vehicles(make,model,year)').eq('buyer_id', u.user.id).order('created_at', { ascending: false });
    if (error) Alert.alert('Unable to load enquiries', error.message);
    setRows(data || []); setLoading(false);
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  return <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
    <Text style={{ color: C.text, fontSize: 24, fontWeight: '900', marginBottom: 12 }}>My enquiries</Text>
    <Button title="Log in / create account" secondary onPress={() => router.push('/auth')} />
    {loading ? <Busy /> : rows.length ? rows.map(r => <View key={r.id} style={{ backgroundColor: C.card, padding: 14, borderRadius: 12, marginBottom: 10 }}>
      <Text style={{ color: C.text, fontWeight: '800' }}>{r.vehicle?.year} {r.vehicle?.make} {r.vehicle?.model}</Text>
      <Text style={{ color: C.muted, marginTop: 5 }}>{r.message}</Text>
      <Text style={{ color: C.red, marginTop: 8 }}>Status: {r.status}</Text>
    </View>) : <Empty title="No enquiries yet" detail="Open a vehicle listing and send an enquiry to the seller." />}
  </ScrollView>;
}