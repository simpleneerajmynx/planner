import React from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"
import { ArrowLeft, ZoomIn, ZoomOut, Maximize } from "lucide-react"
import Particle from "./options"
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

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
    <TooltipProvider>
      <AnimatePresence>
        <div className="absolute top-6 left-6 flex gap-1">
          {/* <motion.div
            key={"options"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Particle />
          </motion.div> */}

          {zoomedGroup && (
            <motion.div
              key="back-button"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant={"outline"}
                      render={<motion.button />}
                      onClick={resetZoom}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Stadium
                    </Button>
                  }
                />
                <TooltipPopup>
                  Back to Stadium
                  <KbdGroup>
                    <Kbd>esc</Kbd>
                  </KbdGroup>
                </TooltipPopup>
              </Tooltip>
            </motion.div>
          )}
        </div>
      </AnimatePresence>

      <div className="absolute right-6 bottom-6 flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size={"icon"}
                variant={"outline"}
                onClick={() => zoomBy(1.5)}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            }
          />
          <TooltipPopup>
            Zoom In
            <KbdGroup>
              <Kbd>+</Kbd>
            </KbdGroup>
          </TooltipPopup>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size={"icon"}
                variant={"outline"}
                onClick={() => zoomBy(0.667)}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
            }
          />
          <TooltipPopup>
            Zoom Out
            <KbdGroup>
              <Kbd>-</Kbd>
            </KbdGroup>
          </TooltipPopup>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button size={"icon"} variant={"outline"} onClick={resetZoom}>
                <Maximize className="h-5 w-5" />
              </Button>
            }
          />
          <TooltipPopup>
            Reset View
            <KbdGroup>
              <Kbd>0</Kbd>
            </KbdGroup>
          </TooltipPopup>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export default StadiumControls
