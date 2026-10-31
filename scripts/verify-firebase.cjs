const crypto=require('node:crypto');
const key=process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const base=`https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const accounts=[];let written;let failed=false;
async function auth(method,body){const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json();return{status:r.status,data:j}}
(async()=>{
 try{
  const anon=await fetch(`${base}/users/poros-access-probe/tasks/nonexistent?key=${key}`);console.log('Unauthenticated task read:',anon.status); if(anon.status!==403)failed=true;
  for(let i=0;i<2;i++){const email=`poros-check-${crypto.randomUUID()}@example.invalid`,password=crypto.randomBytes(24).toString('base64url');const a=await auth('signUp',{email,password,returnSecureToken:true});if(a.status!==200){console.log('Account creation:',a.status,a.data.error?.message);failed=true;return}accounts.push({...a.data,email,password})}
  console.log('Two disposable email/password accounts created');
  const owner=accounts[0],other=accounts[1],id='verification-'+crypto.randomUUID();const path=`${base}/users/${owner.localId}/tasks/${id}?key=${key}`;
  const task={id,title:'Poros integration verification',kind:'Estimate',status:'To do',due:'2026-09-20',createdAt:new Date().toISOString()};
  const r=await fetch(path,{method:'PATCH',headers:{Authorization:`Bearer ${owner.idToken}`,'Content-Type':'application/json'},body:JSON.stringify({fields:Object.fromEntries(Object.entries(task).map(([k,v])=>[k,{stringValue:v}]))})});
  console.log('Owner task write:',r.status);if(!r.ok)failed=true;if(r.ok)written={path,token:owner.idToken};
  if(r.ok){for(const[label,token]of[['owner',owner.idToken],['other account',other.idToken],['anonymous',null]]){const read=await fetch(path,{headers:token?{Authorization:`Bearer ${token}`}:{}});console.log(label+' task read:',read.status);if(read.status!==(label==='owner'?200:403))failed=true}}
  const login=await auth('signInWithPassword',{email:owner.email,password:owner.password,returnSecureToken:true});console.log('Email/password sign-in:',login.status);if(login.status!==200)failed=true;
 }finally{
  if(written){const d=await fetch(written.path,{method:'DELETE',headers:{Authorization:`Bearer ${written.token}`}});console.log('Verification task cleanup:',d.status);if(!d.ok)failed=true}
  for(const account of accounts){const d=await auth('delete',{idToken:account.idToken});console.log('Disposable account cleanup:',d.status);if(d.status!==200)failed=true}
  if(failed)process.exitCode=1;
 }
})().catch(e=>{console.log('Verification failed:',e.name);process.exitCode=1});
