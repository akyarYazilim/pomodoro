import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn (clsx + tailwind-merge)", () => {
  describe("Tek sınıf", () => {
    it("tek string sınıfı olduğu gibi döner", () => {
      expect(cn("text-red-500")).toBe("text-red-500")
    })

    it("boş string geçilirse boş string döner", () => {
      expect(cn("")).toBe("")
    })

    it("argüman geçilmezse boş string döner", () => {
      expect(cn()).toBe("")
    })
  })

  describe("Birden fazla sınıf birleştirme", () => {
    it("iki sınıfı boşlukla birleştirir", () => {
      expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold")
    })

    it("üç veya daha fazla sınıfı birleştirir", () => {
      expect(cn("flex", "items-center", "justify-between", "gap-4")).toBe(
        "flex items-center justify-between gap-4"
      )
    })

    it("dizi olarak verilen sınıfları birleştirir", () => {
      expect(cn(["px-4", "py-2"])).toBe("px-4 py-2")
    })
  })

  describe("Koşullu sınıflar — falsy değerler filtrelenir", () => {
    it("false geçildiğinde o sınıf eklenmez", () => {
      expect(cn("base", false && "hidden")).toBe("base")
    })

    it("undefined geçildiğinde yoksayılır", () => {
      expect(cn("base", undefined)).toBe("base")
    })

    it("null geçildiğinde yoksayılır", () => {
      expect(cn("base", null)).toBe("base")
    })

    it("0 geçildiğinde yoksayılır", () => {
      expect(cn("base", 0 as unknown as string)).toBe("base")
    })

    it("koşul true olduğunda sınıf eklenir", () => {
      const isActive = true
      expect(cn("base", isActive && "active")).toBe("base active")
    })

    it("koşul false olduğunda sınıf eklenmez", () => {
      const isActive = false
      expect(cn("base", isActive && "active")).toBe("base")
    })

    it("nesne sözdizimi — true key eklenir, false key eklenmez", () => {
      expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe(
        "text-red-500"
      )
    })

    it("karışık koşullu ve sabit sınıflar", () => {
      const disabled = false
      const loading = true
      expect(cn("btn", disabled && "btn-disabled", loading && "btn-loading")).toBe(
        "btn btn-loading"
      )
    })
  })

  describe("Tailwind merge — çakışan sınıflar", () => {
    it("sonraki padding sınıfı öncekini ezer (p-4 + p-2 → p-2)", () => {
      expect(cn("p-4", "p-2")).toBe("p-2")
    })

    it("sonraki margin sınıfı öncekini ezer (m-4 + m-8 → m-8)", () => {
      expect(cn("m-4", "m-8")).toBe("m-8")
    })

    it("sonraki text-color sınıfı öncekini ezer", () => {
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
    })

    it("sonraki font-size sınıfı öncekini ezer", () => {
      expect(cn("text-sm", "text-lg")).toBe("text-lg")
    })

    it("çakışmayan sınıflar ikisi de korunur", () => {
      expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold")
    })

    it("eksen bazlı padding çakışmaz — px ve py ayrı ayrı korunur", () => {
      const result = cn("px-4", "py-2")
      expect(result).toContain("px-4")
      expect(result).toContain("py-2")
    })

    it("px-4 üzerine p-2 gelince px-4 ezilebilir (p-* px-*'i kapsar)", () => {
      // tailwind-merge, p-2'nin px ve py'yi kapsadığını bilir
      expect(cn("px-4", "p-2")).toBe("p-2")
    })

    it("koşullu çakışma — koşul true olduğunda merge doğru çalışır", () => {
      const override = true
      expect(cn("rounded-sm", override && "rounded-lg")).toBe("rounded-lg")
    })

    it("koşullu çakışma — koşul false olduğunda başlangıç sınıfı kalır", () => {
      const override = false
      expect(cn("rounded-sm", override && "rounded-lg")).toBe("rounded-sm")
    })
  })
})
