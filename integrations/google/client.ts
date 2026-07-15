import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/integrations/google/security";

type TokenResponse={access_token?:string;expires_in?:number;error?:string};
export async function googleAccessToken(userId:string,requiredScope:string){
  const connection=await prisma.integrationConnection.findUnique({where:{userId_provider:{userId,provider:"google"}}});
  if(!connection||connection.revokedAt)throw new GoogleConnectionError("Connect Google before continuing",401);
  if(!connection.grantedScopes.includes(requiredScope))throw new GoogleConnectionError("This Google permission has not been granted",403);
  const clientId=process.env.GOOGLE_CLIENT_ID,clientSecret=process.env.GOOGLE_CLIENT_SECRET;
  if(!clientId||!clientSecret)throw new GoogleConnectionError("Google integration is not configured",503);
  const response=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:decryptToken(connection.encryptedRefreshToken),grant_type:"refresh_token"}),cache:"no-store"});
  const token=await response.json() as TokenResponse;
  if(!response.ok||!token.access_token)throw new GoogleConnectionError("Google access could not be refreshed",401);
  return token.access_token;
}
export async function googleJson<T>(userId:string,scope:string,url:string,init?:RequestInit){const token=await googleAccessToken(userId,scope);const response=await fetch(url,{...init,headers:{authorization:`Bearer ${token}`,"content-type":"application/json",...(init?.headers??{})},cache:"no-store"});if(!response.ok){const message=await response.text();throw new GoogleConnectionError(`Google request failed (${response.status}): ${message.slice(0,180)}`,response.status)}return response.json() as Promise<T>}
export class GoogleConnectionError extends Error{constructor(message:string,readonly status:number){super(message)}}
export function googleErrorResponse(error:unknown){if(error instanceof GoogleConnectionError)return Response.json({error:error.message},{status:error.status});return Response.json({error:"Google request failed"},{status:500})}
