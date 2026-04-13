import React from "react"
import { Button } from "../ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip"

const DarkMode = () => {
  const { setTheme, theme } = useTheme()
  const isDarkMode = theme === "dark"
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        render={
          <Button size={"icon"} variant={"outline"}>
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </Button>
        }
      />
      <TooltipPopup>{isDarkMode ? "Light Mode" : "Dark Mode"}</TooltipPopup>
    </Tooltip>
  )
}

export default DarkMode
