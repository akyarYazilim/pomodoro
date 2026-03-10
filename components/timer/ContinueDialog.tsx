import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatSeconds } from "@/lib/utils/format"

interface ContinueDialogProps {
  open: boolean
  elapsedSeconds: number
  onContinue: () => void
  onFinish: () => void
}

export function ContinueDialog({ open, elapsedSeconds, onContinue, onFinish }: ContinueDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="flex flex-col items-center gap-5 pt-8 pb-8">
          <div className="text-center">
            <p className="text-xl font-semibold">Devam etmek istiyor musun?</p>
            <p className="text-sm text-muted-foreground mt-2">
              {formatSeconds(elapsedSeconds)} odaklandın.
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <Button className="flex-1" onClick={onContinue}>
              Devam Et
            </Button>
            <Button variant="outline" className="flex-1" onClick={onFinish}>
              Bitir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
