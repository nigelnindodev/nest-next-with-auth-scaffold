import { cookies } from 'next/headers';

export async function hasAuthToken(): Promise<boolean> {
  console.log('Checking has authToken');
  const cookieStore = await cookies();
  const authToken = cookieStore.get('_nexus_xborg');
  const result = !!authToken?.value;
  return result;
}
