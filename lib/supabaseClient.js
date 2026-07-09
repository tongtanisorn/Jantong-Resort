import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

export function bookingToDb(booking) {
  return {
    id: booking.id,
    guest_name: booking.guestName,
    phone: booking.phone,
    check_in: booking.checkIn,
    check_out: booking.checkOut,
    room_type: booking.roomType,
    guests: booking.guests,
    add_ons: booking.addOns || [],
    note: booking.note || "",
    deposit_amount: booking.depositAmount,
    deposit_status: booking.depositStatus,
    booking_status: booking.bookingStatus,
    slip_name: booking.slipName || null,
    slip_data_url: booking.slipDataUrl || null,
    slip_uploaded_at: booking.slipUploadedAt || null,
    created_at: booking.createdAt
  };
}

export function bookingFromDb(row) {
  return {
    id: row.id,
    guestName: row.guest_name,
    phone: row.phone,
    checkIn: row.check_in,
    checkOut: row.check_out,
    roomType: row.room_type,
    guests: row.guests,
    addOns: row.add_ons || [],
    note: row.note || "",
    depositAmount: row.deposit_amount,
    depositStatus: row.deposit_status,
    bookingStatus: row.booking_status,
    slipName: row.slip_name,
    slipDataUrl: row.slip_data_url,
    slipUploadedAt: row.slip_uploaded_at,
    createdAt: row.created_at
  };
}

function bookingChangesToDb(changes) {
  const dbChanges = {};
  const map = {
    guestName: "guest_name",
    phone: "phone",
    checkIn: "check_in",
    checkOut: "check_out",
    roomType: "room_type",
    guests: "guests",
    addOns: "add_ons",
    note: "note",
    depositAmount: "deposit_amount",
    depositStatus: "deposit_status",
    bookingStatus: "booking_status",
    slipName: "slip_name",
    slipDataUrl: "slip_data_url",
    slipUploadedAt: "slip_uploaded_at",
    createdAt: "created_at"
  };

  Object.entries(map).forEach(([appKey, dbKey]) => {
    if (changes[appKey] !== undefined) dbChanges[dbKey] = changes[appKey];
  });

  return dbChanges;
}

export async function createBookingInSupabase(booking) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };

  const { data, error } = await supabase
    .from("bookings")
    .insert(bookingToDb(booking))
    .select()
    .single();

  return { data: data ? bookingFromDb(data) : null, error };
}

export async function getBookingsFromSupabase() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: [], error: new Error("Supabase is not configured") };

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: data ? data.map(bookingFromDb) : [], error };
}

export async function updateBookingInSupabase(id, changes) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };

  const dbChanges = bookingChangesToDb(changes);

  const { data, error } = await supabase
    .from("bookings")
    .update(dbChanges)
    .eq("id", id)
    .select()
    .single();

  return { data: data ? bookingFromDb(data) : null, error };
}
