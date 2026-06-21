// Supabase Edge Function: create-patient
// Creates a new patient auth user + profile + patients row.
// Must run with the service role key (server-side only) since
// creating auth users is a privileged operation that the public
// anon key is not allowed to do.
//
// Security: this function checks that the CALLER (via their JWT)
// is a doctor before allowing patient creation. Patients cannot
// call this to create other accounts.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client scoped to the caller's JWT, used only to verify identity/role.
    const callerClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Admin client (service role) to check the caller's profile and perform privileged writes.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !callerProfile || callerProfile.role !== "doctor") {
      return new Response(JSON.stringify({ error: "Only the doctor can create patient accounts" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const body = await req.json();
    const {
      full_name, email, password, phone, date_of_birth, gender, address,
      height_cm, weight_kg, emergency_contact_name, emergency_contact_phone,
      goals, medical_history, status
    } = body;

    if (!full_name || !email || !password) {
      return new Response(JSON.stringify({ error: "full_name, email, and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Create the auth user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError || !newUser?.user) {
      return new Response(JSON.stringify({ error: createError?.message || "Failed to create user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const newUserId = newUser.user.id;

    // Create the profile row
    const { error: insertProfileError } = await adminClient.from("profiles").insert({
      id: newUserId,
      role: "patient",
      full_name,
      email,
      phone: phone || null,
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      address: address || null
    });

    if (insertProfileError) {
      // Roll back the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: insertProfileError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Create the patients row
    const { error: insertPatientError } = await adminClient.from("patients").insert({
      id: newUserId,
      medical_history: medical_history || null,
      goals: goals || null,
      height_cm: height_cm || null,
      weight_kg: weight_kg || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_phone: emergency_contact_phone || null,
      status: status || "active",
      created_by: user.id
    });

    if (insertPatientError) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: insertPatientError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true, id: newUserId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
