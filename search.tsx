import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { C } from '@/lib/theme';
import { Vehicle } from '@/types';
import { Button, Empty, Field, Label, Busy } from '@/components/UI';
import CarCard from '@/components/CarCard';

export default function Search() {
  const params = useLocalSearchParams<{body?: string}>();
  const [keyword, setKeyword] = useState('');
  const [make, setMake] = useState('');
  const [body, setBody] = useState(params.body || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minYear, setMinYear] = useState('');
  const [sort, setSort] = useState<'newest'|'low'|'high'>('newest');
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const search = async () => {
    setLoading(true);
    let q = supabase.from('vehicles').select('*').eq('status', 'published');
    if (keyword.trim()) q = q.or(`make.ilike.%${keyword.trim()}%,model.ilike.%${keyword.trim()}%,variant.ilike.%${keyword.trim()}%`);
    if (make.trim()) q = q.ilike('make', `%${make.trim()}%`);
    if (body.trim()) q = q.ilike('body_type', `%${body.trim()}%`);
    if (minPrice) q = q.gte('price', Number(minPrice));
    if (maxPrice) q = q.lte('price', Number(maxPrice));
    if (minYear) q = q.gte('year', Number(minYear));
    q = q.order(sort === 'low' ? 'price' : sort === 'high' ? 'price' : 'created_at', { ascending: sort === 'low' || sort === 'newest' ? sort === 'low' : false }).limit(100);
    const { data, error } = await q;
    if (error) Alert.alert('Search failed', error.message);
    setCars((data || []) as Vehicle[]);
    setLoading(false);
  };
  useEffect(() => { search(); }, []);
  return <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
    <Text style={{ color: C.text, fontSize: 24, fontWeight: '900', marginBottom: 14 }}>Search cars</Text>
    <Label>Keyword</Label><Field value={keyword} onChangeText={setKeyword} placeholder="e.g. Civic, Myvi, Tesla" autoCapitalize="none" />
    <Label>Make</Label><Field value={make} onChangeText={setMake} placeholder="Toyota, Honda, Perodua..." />
    <Label>Body type</Label><Field value={body} onChangeText={setBody} placeholder="SUV, Sedan, Hatchback..." />
    <Label>Minimum price (RM)</Label><Field value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" placeholder="0" />
    <Label>Maximum price (RM)</Label><Field value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" placeholder="50000" />
    <Label>Year from</Label><Field value={minYear} onChangeText={setMinYear} keyboardType="numeric" placeholder="2018" />
    <Label>Sort by</Label>
    <Text onPress={() => setSort('newest')} style={{ color: sort === 'newest' ? C.red : C.muted, marginBottom: 8 }}>● Newest listings</Text>
    <Text onPress={() => setSort('low')} style={{ color: sort === 'low' ? C.red : C.muted, marginBottom: 8 }}>● Lowest price</Text>
    <Text onPress={() => setSort('high')} style={{ color: sort === 'high' ? C.red : C.muted, marginBottom: 12 }}>● Highest price</Text>
    <Button title="Apply filters" onPress={search} />
    <Button title="Reset filters" secondary onPress={() => { setKeyword(''); setMake(''); setBody(''); setMinPrice(''); setMaxPrice(''); setMinYear(''); setSort('newest'); }} />
    <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginVertical: 15 }}>Results: {cars.length}</Text>
    {loading ? <Busy /> : cars.length ? cars.map(car => <CarCard key={car.id} car={car} />) : <Empty title="No matching cars" detail="Try different keywords or widen your filters." />}
  </ScrollView>;
}