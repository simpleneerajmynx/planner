import { useEffect, useState } from "react"

const useDimension = (ref: React.RefObject<HTMLElement>) => {
  const [mapDimensions, setMapDimensions] = useState({
    width: 860,
    height: 620,
  })
  // Responsive dimensions
  useEffect(() => {
    const updateDims = () => {
      if (!ref.current) return
      const w = ref.current.clientWidth
      const h = ref.current.clientHeight
      setMapDimensions({ width: Math.floor(w), height: Math.floor(h) })
    }

    updateDims()

    const ro = new ResizeObserver(updateDims)
    if (ref.current) ro.observe(ref.current)

    return () => ro.disconnect()
  }, [])
  return mapDimensions
}

export default useDimension
