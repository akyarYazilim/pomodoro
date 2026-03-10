// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

describe("useNetworkStatus", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      writable: true,
      value: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns online=true when navigator.onLine is true", () => {
    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current.isOnline).toBe(true)
  })

  it("returns online=false when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false })
    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current.isOnline).toBe(false)
  })

  it("switches to offline when 'offline' event fires", () => {
    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current.isOnline).toBe(true)

    act(() => {
      window.dispatchEvent(new Event("offline"))
    })

    expect(result.current.isOnline).toBe(false)
  })

  it("switches back to online when 'online' event fires", () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false })
    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current.isOnline).toBe(false)

    act(() => {
      window.dispatchEvent(new Event("online"))
    })

    expect(result.current.isOnline).toBe(true)
  })

  it("removes event listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => useNetworkStatus())
    unmount()
    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith("offline", expect.any(Function))
  })
})
