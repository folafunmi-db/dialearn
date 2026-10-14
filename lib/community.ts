import {createClient,type SupabaseClient} from '@supabase/supabase-js';
let client:SupabaseClient|null=null;
export function communityClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)return null;return client??=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});}
export type Profile={id:string;display_name:string;bio:string;role:'learner'|'educator'|'moderator'};
export type Lesson={id:string;educator_id:string;title:string;summary:string;body:string;challenge:string;schematic_description:string;schematic_path:string|null;sources:string[];language:string;stage:string;object_id:string;status:'draft'|'published';created_at:string;published_at:string|null};
export type Discussion={id:string;lesson_id:string;author_id:string;body:string;status:'pending'|'approved'|'hidden';created_at:string};
export type Notice={id:string;lesson_id:string;created_at:string;read_at:string|null;title:string};
export const stageOptions=[{value:'foundations',label:'Beginner'},{value:'systems',label:'Intermediate'},{value:'engineering',label:'Advanced'}];
export function validateSources(value:string){const links=value.split('\n').map(s=>s.trim()).filter(Boolean);if(!links.length||links.length>8)throw new Error('Add 1–8 credible source links, one per line.');for(const link of links){const url=new URL(link);if(url.protocol!=='https:'||url.username||url.password)throw new Error('Sources must use HTTPS links without embedded credentials.');}return links;}
export const schematicTypes=['image/png','image/jpeg','image/webp'];
export function validateSchematic(file:File){if(!schematicTypes.includes(file.type)||file.size>5*1024*1024)throw new Error('Use a PNG, JPEG or WebP schematic up to 5 MB.');}
