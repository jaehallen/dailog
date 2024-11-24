import type { SvelteFetch } from "$lib/types/schema";
import { env } from '$env/dynamic/private';
import { parseJSON } from "$lib/utility";

export async function hashPassword(
  fetch: SvelteFetch,
  password: string
): Promise<{ data: string, error?: never } | { data: null, error: { message: string } }> {
  const url = env.HASH_URL
  const token = env.API_TOKEN

  if (!url || !token) {
    return { data: null, error: { message: "Invalid configuration" } };
  }

  const res = await fetch(url + "/auth/hash", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  })

  if (res.status !== 200) {
    return { data: null, error: { message: "failed to hash password" } };
  }

  const resData = parseJSON(await res.json());

  if (resData.success !== "ok") {
    return { data: null, error: { message: "failed to hash password" } }
  }

  return {
    data: resData.data
  }
}

export async function verifyPassword(
  fetch: SvelteFetch,
  data: { password: string, password_hash: string }
): Promise<{ data: boolean, error?: never } | { data: null, error: { message: string } }> {
  const url = env.HASH_URL
  const token = env.API_TOKEN

  if (!url || !token) {
    return { data: null, error: { message: "Invalid configuration" } };
  }

  const res = await fetch(url + "/auth/verify", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (res.status !== 200) {
    return { data: null, error: { message: "Invalid Password" } };
  }

  const resData = parseJSON(await res.json());

  if (resData.success !== "ok") {
    return { data: null, error: { message: "Invalid Password" } }
  }

  return {
    data: resData.data
  }
}