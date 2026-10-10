import { useState } from 'react';
import { Alert, Image, ScrollView, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { C } from '@/lib/theme';
import { Button, Field, Label } from '@/components/UI';
export default function Sell() {
  const [make,setMake]=useState(''); const [model,setModel]=useState(''); const [variant,setVariant]=useState('');
  const [year,setYear]=useState(''); const [price,setPrice]=useState(''); const [mileage,setMileage]=useState('');
  const [transmission,setTransmission]=useState('Automatic'); const [fuel,setFuel]=useState('Petrol');
  const [body,setBody]=useState('Sedan'); const [location,setLocation]=useState(''); const [condition,setCondition]=useState('Used');
  const [description,setDescription]=useState(''); const [uris,setUris]=useState<string[]>([]); const [busy,setBusy]=useState(false);
  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to select car images.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.75, selectionLimit: 8 });
    if (!result.canceled) setUris(result.assets.map(a=>a.uri).slice(0,8));
  };
  const submit = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return Alert.alert('Log in required', 'Log in before publishing a car listing.', [{ text:'Cancel' },{ text:'Log in', onPress:()=>router.push('/auth') }]);
    if (!make.trim() || !model.trim() || !year || !price || !location.trim()) return Alert.alert('Missing information', 'Make, model, year, price and location are required.');
    if (!Number.isInteger(Number(year)) || Number(year) < 1950 || Number(year) > new Date().getFullYear()+1) return Alert.alert('Invalid year', 'Enter a valid manufacturing year.');
    if (Number(price) <= 0) return Alert.alert('Invalid price', 'Price must be greater than zero.');
    if (!isSupabaseConfigured) return Alert.alert('Backend not configured', 'Set up Supabase first.');
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const uri of uris) {
        const response = await fetch(uri); const blob = await response.blob();
        const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
        const path = `${u.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('vehicle-images').upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('vehicle-images').getPublicUrl(path); urls.push(data.publicUrl);
      }
      const { error } = await supabase.from('vehicles').insert({
        seller_id: u.user.id, make: make.trim(), model: model.trim(), variant: variant.trim() || null,
        year: Number(year), price: Number(price), mileage_km: mileage ? Number(mileage) : null,
        transmission, fuel_type: fuel, body_type: body, location: location.trim(), condition,
        description: description.trim() || null, image_urls: urls, status: 'pending_review'
      });
      if (error) throw error;
      Alert.alert('Listing submitted', 'Your listing is pending review and will not appear publicly until approved.');
      router.replace('/(tabs)/profile');
    } catch (e:any) { Alert.alert('Could not submit listing', e.message || 'Please try again.'); }
    finally { setBusy(false); }
  };
  return <ScrollView style={{ backgroundColor:C.bg }} contentContainerStyle={{ padding:18 }}>
    <Text style={{ color:C.text, fontSize:25, fontWeight:'900', marginBottom:8 }}>Sell your car</Text>
    <Text style={{ color:C.muted, marginBottom:18 }}>Listings are submitted for review before publication.</Text>
    <Label>Make *</Label><Field value={make} onChangeText={setMake} placeholder="e.g. Honda" />
    <Label>Model *</Label><Field value={model} onChangeText={setModel} placeholder="e.g. Civic" />
    <Label>Variant</Label><Field value={variant} onChangeText={setVariant} placeholder="e.g. 1.5 VTEC Turbo" />
    <Label>Manufacturing year *</Label><Field value={year} onChangeText={setYear} keyboardType="numeric" placeholder="2021" />
    <Label>Asking price (RM) *</Label><Field value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="85000" />
    <Label>Mileage (km)</Label><Field value={mileage} onChangeText={setMileage} keyboardType="numeric" placeholder="45000" />
    <Label>Transmission</Label><Field value={transmission} onChangeText={setTransmission} placeholder="Automatic / Manual" />
    <Label>Fuel type</Label><Field value={fuel} onChangeText={setFuel} placeholder="Petrol / Diesel / Hybrid / Electric" />
    <Label>Body type</Label><Field value={body} onChangeText={setBody} placeholder="Sedan / SUV / Hatchback" />
    <Label>Location *</Label><Field value={location} onChangeText={setLocation} placeholder="Taiping, Perak" />
    <Label>Condition</Label><Field value={condition} onChangeText={setCondition} placeholder="Used / New" />
    <Label>Description, service history and known defects</Label><Field value={description} onChangeText={setDescription} multiline numberOfLines={5} style={{ minHeight:110, textAlignVertical:'top' }} placeholder="Describe condition honestly..." />
    <Button title="Choose vehicle photos (up to 8)" secondary onPress={pick} />
    {uris.map(uri=><Image key={uri} source={{uri}} style={{width:'100%',height:140,borderRadius:10,marginBottom:8}} />)}
    <Button title={busy ? 'Submitting...' : 'Submit for review'} disabled={busy} onPress={submit} />
  </ScrollView>;
}