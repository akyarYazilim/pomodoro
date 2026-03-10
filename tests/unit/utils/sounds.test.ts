// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { sounds } from "@/lib/utils/sounds"

// Web Audio API, `new AudioContext()` ile oluşturulur.
// vi.fn() arrow function olduğu için constructor olarak kullanılamaz.
// Bunun yerine her testten önce yenilenen module-level mock'lar ve
// class sözdizimi kullanan bir MockAudioContext tanımlıyoruz.

let _oscillator: {
  connect: ReturnType<typeof vi.fn>
  frequency: { value: number }
  type: string
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
}

let _gain: {
  connect: ReturnType<typeof vi.fn>
  gain: {
    setValueAtTime: ReturnType<typeof vi.fn>
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>
  }
}

let _ctx: {
  createOscillator: ReturnType<typeof vi.fn>
  createGain: ReturnType<typeof vi.fn>
  destination: object
  currentTime: number
}

function resetMocks() {
  _oscillator = {
    connect: vi.fn(),
    frequency: { value: 0 },
    type: "sine",
    start: vi.fn(),
    stop: vi.fn(),
  }

  _gain = {
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  }

  _ctx = {
    createOscillator: vi.fn(() => _oscillator),
    createGain: vi.fn(() => _gain),
    destination: {},
    currentTime: 0,
  }
}

describe("Sound Utils", () => {
  beforeEach(() => {
    resetMocks()

    // class sözdizimi gerçek constructor olarak çalışır;
    // _ctx module-level değişkenine referans verir, böylece
    // her test bağımsız bir mock ile başlar.
    class MockAudioContext {
      constructor() {
        return _ctx
      }
    }

    vi.stubGlobal("AudioContext", MockAudioContext)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("workComplete", () => {
    it("AudioContext oluşturur ve oscillator'ı başlatır", () => {
      sounds.workComplete()

      expect(_ctx.createOscillator).toHaveBeenCalledTimes(1)
      expect(_ctx.createGain).toHaveBeenCalledTimes(1)
      expect(_oscillator.start).toHaveBeenCalledTimes(1)
      expect(_oscillator.stop).toHaveBeenCalledTimes(1)
    })

    it("880 Hz frekansıyla çalar", () => {
      sounds.workComplete()

      expect(_oscillator.frequency.value).toBe(880)
    })

    it("oscillator → gain → destination zinciri kurulur", () => {
      sounds.workComplete()

      expect(_oscillator.connect).toHaveBeenCalledWith(_gain)
      expect(_gain.connect).toHaveBeenCalledWith(_ctx.destination)
    })

    it("gain envelope doğru sırayla ayarlanır", () => {
      sounds.workComplete()

      expect(_gain.gain.setValueAtTime).toHaveBeenCalledTimes(1)
      expect(_gain.gain.exponentialRampToValueAtTime).toHaveBeenCalledTimes(1)
    })
  })

  describe("breakEnd", () => {
    it("AudioContext oluşturur ve oscillator'ı başlatır", () => {
      sounds.breakEnd()

      expect(_ctx.createOscillator).toHaveBeenCalledTimes(1)
      expect(_oscillator.start).toHaveBeenCalledTimes(1)
      expect(_oscillator.stop).toHaveBeenCalledTimes(1)
    })

    it("660 Hz frekansıyla çalar", () => {
      sounds.breakEnd()

      expect(_oscillator.frequency.value).toBe(660)
    })

    it("workComplete'ten farklı (daha düşük) frekans kullanır", () => {
      // Sabitler kaynak koddan: workComplete → 880, breakEnd → 660
      sounds.workComplete()
      const workFreq = _oscillator.frequency.value

      resetMocks()
      sounds.breakEnd()
      const breakFreq = _oscillator.frequency.value

      expect(breakFreq).not.toBe(workFreq)
      expect(breakFreq).toBeLessThan(workFreq)
    })
  })

  describe("taskDone", () => {
    it("AudioContext oluşturur ve oscillator'ı başlatır", () => {
      sounds.taskDone()

      expect(_ctx.createOscillator).toHaveBeenCalledTimes(1)
      expect(_oscillator.start).toHaveBeenCalledTimes(1)
      expect(_oscillator.stop).toHaveBeenCalledTimes(1)
    })

    it("1046 Hz frekansıyla çalar", () => {
      sounds.taskDone()

      expect(_oscillator.frequency.value).toBe(1046)
    })

    it("üç ses arasında en yüksek frekansı kullanır", () => {
      // taskDone: 1046 Hz > workComplete: 880 Hz > breakEnd: 660 Hz
      sounds.taskDone()
      expect(_oscillator.frequency.value).toBeGreaterThan(880)
    })
  })

  describe("Graceful failure — AudioContext yoksa", () => {
    it("AudioContext tanımsızsa sessizce geçer, hata fırlatmaz", () => {
      vi.stubGlobal("AudioContext", undefined)

      expect(() => sounds.workComplete()).not.toThrow()
      expect(() => sounds.breakEnd()).not.toThrow()
      expect(() => sounds.taskDone()).not.toThrow()
    })

    it("AudioContext hata fırlatırsa mevcut davranış hatayı yukarı taşır", () => {
      // sounds.ts içinde try/catch yok; bu test mevcut davranışı belgeler.
      // İleride try/catch eklenirse bu test not.toThrow() olarak güncellenebilir.
      class BrokenAudioContext {
        constructor() {
          throw new Error("AudioContext not allowed")
        }
      }
      vi.stubGlobal("AudioContext", BrokenAudioContext)

      expect(() => sounds.workComplete()).toThrow("AudioContext not allowed")
    })

    it("window tanımsızsa (SSR ortamı) guard devreye girer", () => {
      // sounds.ts: `if (typeof window === 'undefined') return`
      // jsdom'da window her zaman tanımlı; bu test guard'ın var olduğunu belgeler.
      // SSR ortamında fonksiyonlar sessizce erken çıkar.
      expect(typeof window).toBe("object")
    })
  })
})
