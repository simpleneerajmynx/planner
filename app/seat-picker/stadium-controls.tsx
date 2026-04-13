import React from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"
import { ArrowLeft, ZoomIn, ZoomOut, Maximize } from "lucide-react"

type StadiumControlsProps = {
  zoomedGroup: string | null
  resetZoom: () => void
  zoomBy: (factor: number) => void
}

const StadiumControls: React.FC<StadiumControlsProps> = ({
  zoomedGroup,
  resetZoom,
  zoomBy,
}) => {
  return (
    <>
      <AnimatePresence>
        {zoomedGroup && (
          <motion.div
            key="back-button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Button
              variant={"outline"}
              render={<motion.button />}
              onClick={resetZoom}
              className="absolute top-6 left-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Stadium
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute right-6 bottom-6 flex flex-col gap-2">
        <Button size={"icon"} variant={"outline"} onClick={() => zoomBy(1.5)}>
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button size={"icon"} variant={"outline"} onClick={() => zoomBy(0.667)}>
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          size={"icon"}
          variant={"outline"}
          onClick={resetZoom}
          title="Reset View"
        >
          <Maximize className="h-5 w-5" />
        </Button>
      </div>
    </>
  )
}

export default StadiumControls
