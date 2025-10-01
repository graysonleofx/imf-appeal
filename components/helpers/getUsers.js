import supabase from "@/lib/supabaseClient";

export async function getUserFromSupabase (userId){
  if (!userId) return null;
  const { data, error } = await supabase
    .from('gmail_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error fetching access token:", error);
    setLoading(false);
    return null;
  } 

  console.log('data', data)
  return data;
};