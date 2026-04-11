import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { childId, parentId, schoolId, successUrl, cancelUrl } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch child info for display
    const { data: child } = await supabase
      .from('children')
      .select('first_name, last_name')
      .eq('id', childId)
      .single()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'SwimPass Jahresabo',
            description: `${child?.first_name} ${child?.last_name} — Junior Lifesaver / Lifesaver`,
            images: [],
          },
          unit_amount: 5663, // 56.63 EUR incl. 17% TVA (48.40 + 8.23)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        childId,
        parentId,
        schoolId,
      },
      payment_intent_data: {
        metadata: { childId, parentId, schoolId },
      },
    })

    // Record pending payment
    await supabase.from('payments').insert({
      child_id: childId,
      parent_id: parentId,
      school_id: schoolId,
      stripe_session_id: session.id,
      amount: 5663,
      status: 'pending',
    })

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
