import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { C } from '@/lib/theme';
import { money } from '@/lib/format';
import { Field, Label } from '@/components/UI';
export default function Calculator() {
  const [price,setPrice]=useState('50000'); const [down,setDown]=useState('10000'); const [rate,setRate]=useState('3.2'); const [years,setYears]=useState('7');
  const p=Math.max(0,Number(price)||0); const d=Math.min(p,Math.max(0,Number(down)||0)); const principal=p-d;
  const r=Math.max(0,Number(rate)||0)/100; const term=Math.max(1,Math.min(9,Number(years)||1));
  // Malaysian flat-rate estimate: interest = financed principal x annual flat rate x years.
  const interest=principal*r*term; const total=principal+interest; const monthly=total/(term*12);
  return <ScrollView style={{backgroundColor:C.bg}} contentContainerStyle={{padding:18}}>
    <Text style={{color:C.text,fontSize:25,fontWeight:'900',marginBottom:8}}>Car loan calculator</Text>
    <Text style={{color:C.muted,lineHeight:21,marginBottom:18}}>Estimate only. Uses a simple flat-rate method, not a lender quote.</Text>
    <Label>Vehicle price (RM)</Label><Field value={price} onChangeText={setPrice} keyboardType="numeric" />
    <Label>Down payment (RM)</Label><Field value={down} onChangeText={setDown} keyboardType="numeric" />
    <Label>Annual flat interest rate (%)</Label><Field value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
    <Label>Loan term (years, 1–9)</Label><Field value={years} onChangeText={setYears} keyboardType="numeric" />
    <Text style={{color:C.muted,marginTop:15}}>Financing amount</Text><Text style={{color:C.text,fontSize:22,fontWeight:'900'}}>{money(principal)}</Text>
    <Text style={{color:C.muted,marginTop:16}}>Estimated monthly repayment</Text><Text style={{color:C.red,fontSize:30,fontWeight:'900'}}>{money(monthly)}</Text>
    <Text style={{color:C.muted,marginTop:16}}>Estimated total interest</Text><Text style={{color:C.text,fontSize:20,fontWeight:'800'}}>{money(interest)}</Text>
    <Text style={{color:C.muted,marginTop:16}}>Estimated total repayment (excluding down payment)</Text><Text style={{color:C.text,fontSize:20,fontWeight:'800'}}>{money(total)}</Text>
    <Text style={{color:C.muted,lineHeight:21,marginTop:22}}>Actual rates, fees, eligibility, approval and repayment schedules depend on the lender. This calculator does not guarantee financing.</Text>
  </ScrollView>;
}