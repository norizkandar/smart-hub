import { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { C } from '@/lib/theme';
import { Button, Field, Label } from '@/components/UI';
export default function Auth() {
  const [mode, setMode] = useState<'login'|'register'|'reset'>('login');
  const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!isSupabaseConfigured) return Alert.alert('Supabase not configured', 'Copy .env.example to .env and add your Supabase URL and anon/publishable key.');
    if (!email.trim()) return Alert.alert('Check form', 'Enter your email address.');
    if (mode !== 'reset' && password.length < 8) return Alert.alert('Check password', 'Use at least 8 characters.');
    if (mode === 'register' && password !== confirm) return Alert.alert('Passwords do not match', 'Re-enter your password confirmation.');
    setBusy(true);
    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) throw error;
        Alert.alert('Email requested', 'If the account exists, Supabase will send password reset instructions.');
      } else if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim(), phone: phone.trim() } } });
        if (error) throw error;
        if (data.user && data.session) {
          await supabase.from('profiles').upsert({ id: data.user.id, full_name: name.trim(), phone: phone.trim() });
        }
        Alert.alert('Registration submitted', 'Check your email if verification is enabled. You can log in after your account is verified.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.replace('/(tabs)');
      }
    } catch (e: any) { Alert.alert('Account error', e.message || 'Please try again.'); }
    finally { setBusy(false); }
  };
  return <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 20 }}>
    <Text style={{ color: C.red, fontWeight: '900', letterSpacing: 2 }}>BY EONIX TECH STUDIO</Text>
    <Text style={{ color: C.text, fontSize: 28, fontWeight: '900', marginTop: 10 }}>{mode === 'register' ? 'Create account' : mode === 'reset' ? 'Reset password' : 'Welcome back'}</Text>
    <Text style={{ color: C.muted, marginTop: 7, marginBottom: 22 }}>Your next drive starts here.</Text>
    {mode === 'register' && <><Label>Full name</Label><Field value={name} onChangeText={setName} placeholder="Full name" autoCapitalize="words" /><Label>Phone number</Label><Field value={phone} onChangeText={setPhone} placeholder="+60..." keyboardType="phone-pad" /></>}
    <Label>Email address</Label><Field value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
    {mode !== 'reset' && <><Label>Password (minimum 8 characters)</Label><Field value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry /><>{mode === 'register' && <><Label>Confirm password</Label><Field value={confirm} onChangeText={setConfirm} placeholder="Confirm password" secureTextEntry /></>}</>}
    </>}
    <Button title={busy ? 'Please wait...' : mode === 'register' ? 'Create account' : mode === 'reset' ? 'Send reset email' : 'Log in'} disabled={busy} onPress={submit} />
    <Button title={mode === 'login' ? 'Create account' : 'Back to log in'} secondary onPress={() => setMode(mode === 'login' ? 'register' : 'login')} />
    <Button title="Forgot password?" secondary onPress={() => setMode('reset')} />
  </ScrollView>;
}