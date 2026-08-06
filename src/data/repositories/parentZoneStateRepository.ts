import { DEVICE_RECORD_KEY, getFitzeeDatabase } from '../db/fitzeeDb'
import type { ParentZoneState } from '../models'

const INVALID_PARENT_ZONE_STATE: ParentZoneState = {
  gate_verified_at: null,
  gate_valid: false,
}

export async function readParentZoneState(): Promise<ParentZoneState> {
  try {
    const database = await getFitzeeDatabase()
    const stored = database
      ? await database.get('parent_zone_state', DEVICE_RECORD_KEY)
      : null
    return {
      gate_verified_at: stored?.gate_verified_at ?? null,
      gate_valid: false,
    }
  } catch {
    return INVALID_PARENT_ZONE_STATE
  }
}

export async function clearParentZoneState(): Promise<void> {
  try {
    const database = await getFitzeeDatabase()
    await database?.put(
      'parent_zone_state',
      INVALID_PARENT_ZONE_STATE,
      DEVICE_RECORD_KEY,
    )
  } catch {
    // A blocked database already behaves like a cleared parent session.
  }
}
