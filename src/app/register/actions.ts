'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function register(formData: FormData) {
  const supabase = await createClient()

  // Get form data values
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // Validate inputs
  if (!email || !password) {
    console.error('Missing required fields')
    return { error: 'Please provide both email and password' }
  }

  // Register the new user with simple data
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    console.error('Registration error:', error.message)
    return { error: error.message }
  }
  
  // Success, redirect to login or dashboard
  revalidatePath('/', 'layout')
  redirect('/login?registered=true')
}
