import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { C } from '@/lib/theme';
import { Button, Empty } from '@/components/UI';
export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      setProfile(p);
      const { data: v } = await supabase.from('vehicles').select('id,make,model,year,status,price').eq('seller_id', data.user.id).order('created_at', { ascending: false });
      setListings(v || []);
    }
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  const signOut = async () => { const { error } = await supabase.auth.signOut(); if (error) Alert.alert('Sign out failed', error.message); else { setUser(null); router.replace('/auth'); } };
  return <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 18 }}>
    <Text style={{ color: C.red, fontWeight: '900', letterSpacing: 2 }}>SMART CAR HUB</Text>
    <Text style={{ color: C.text, fontSize: 27, fontWeight: '900', marginTop: 8 }}>My account</Text>
    {user ? <>
      <Text style={{ color: C.text, fontSize: 18, marginTop: 18, fontWeight: '800' }}>{profile?.full_name || 'Car Hub member'}</Text>
      <Text style={{ color: C.muted, marginTop: 5 }}>{user.email}</Text>
      <Text style={{ color: C.muted, marginTop: 5 }}>Role: {profile?.role || 'buyer/seller'}</Text>
      <Button title="Create a car listing" onPress={() => router.push('/sell')} />
      <Button title="Estimate car loan" secondary onPress={() => router.push('/calculator')} />
      <Button title="Sign out" secondary onPress={signOut} />
      <Text style={{ color: C.text, fontSize: 20, fontWeight: '800', marginTop: 20, marginBottom: 10 }}>My listings</Text>
      {listings.length ? listings.map(v => <Text key={v.id} onPress={() => router.push(`/car/${v.id}`)} style={{ color: C.text, backgroundColor: C.card, padding: 13, marginBottom: 8, borderRadius: 10 }}>{v.year} {v.make} {v.model} · RM {v.price} · {v.status}</Text>) : <Empty title="No listings" detail="Your vehicles will appear here." />}
    </> : <>
      <Text style={{ color: C.muted, marginVertical: 12 }}>Sign in to manage favorites, listings and enquiries.</Text>
      <Button title="Log in / create account" onPress={() => router.push('/auth')} />
      <Button title="Sell your car" secondary onPress={() => router.push('/sell')} />
    </>}
    <Text style={{ color: C.muted, textAlign: 'center', marginTop: 30 }}>Created by Eonix Tech Studio</Text>
  </ScrollView>;
}