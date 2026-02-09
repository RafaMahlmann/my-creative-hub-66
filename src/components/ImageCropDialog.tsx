import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Check, X } from "lucide-react";

type CropShape = "circle" | "rect";

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
  shape?: CropShape;
  title?: string;
}

const CANVAS_SIZE = 300;
const CIRCLE_RADIUS = 130;
// Rectangle crop area (16:9 aspect for backgrounds)
const RECT_WIDTH = 280;
const RECT_HEIGHT = 158;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const ImageCropDialog = ({
  open,
  imageSrc,
  onConfirm,
  onCancel,
  shape = "circle",
  title = "Ajustar foto",
}: ImageCropDialogProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load image when src changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setImageLoaded(true);
    };
    img.src = imageSrc;
    return () => {
      setImageLoaded(false);
    };
  }, [imageSrc]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    ctx.scale(dpr, dpr);

    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    // Fit image to cover the crop area at zoom=1
    let coverW: number, coverH: number;
    if (shape === "circle") {
      coverW = CIRCLE_RADIUS * 2;
      coverH = CIRCLE_RADIUS * 2;
    } else {
      coverW = RECT_WIDTH;
      coverH = RECT_HEIGHT;
    }

    const scale =
      Math.max(coverW / img.width, coverH / img.height) * zoom;
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = cx - dw / 2 + offset.x;
    const dy = cy - dh / 2 + offset.y;

    // Clear
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw image
    ctx.save();
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();

    // Dark overlay with cutout
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (shape === "circle") {
      ctx.arc(cx, cy, CIRCLE_RADIUS, 0, Math.PI * 2, true);
    } else {
      const rx = cx - RECT_WIDTH / 2;
      const ry = cy - RECT_HEIGHT / 2;
      // Counter-clockwise rect for cutout
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx, ry + RECT_HEIGHT);
      ctx.lineTo(rx + RECT_WIDTH, ry + RECT_HEIGHT);
      ctx.lineTo(rx + RECT_WIDTH, ry);
      ctx.closePath();
    }
    ctx.fill("evenodd");
    ctx.restore();

    // Border
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(cx, cy, CIRCLE_RADIUS, 0, Math.PI * 2);
    } else {
      const rx = cx - RECT_WIDTH / 2;
      const ry = cy - RECT_HEIGHT / 2;
      ctx.roundRect(rx, ry, RECT_WIDTH, RECT_HEIGHT, 4);
    }
    ctx.stroke();
    ctx.restore();
  }, [zoom, offset, shape]);

  useEffect(() => {
    if (imageLoaded) draw();
  }, [imageLoaded, draw]);

  // Mouse / touch handlers
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
      return;
    }
    const pos = getPos(e);
    dragStart.current = pos;
    offsetStart.current = { ...offset };
    setDragging(true);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e && e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastPinchDist.current !== null) {
        const delta = dist / lastPinchDist.current;
        setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * delta)));
      }
      lastPinchDist.current = dist;
      return;
    }

    if (!dragging) return;
    const pos = getPos(e);
    setOffset({
      x: offsetStart.current.x + (pos.x - dragStart.current.x),
      y: offsetStart.current.y + (pos.y - dragStart.current.y),
    });
  };

  const handlePointerUp = () => {
    setDragging(false);
    lastPinchDist.current = null;
  };

  // Scroll zoom (desktop)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * delta)));
  };

  // Crop and export
  const handleConfirm = () => {
    const img = imageRef.current;
    if (!img) return;

    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    let coverW: number, coverH: number;
    if (shape === "circle") {
      coverW = CIRCLE_RADIUS * 2;
      coverH = CIRCLE_RADIUS * 2;
    } else {
      coverW = RECT_WIDTH;
      coverH = RECT_HEIGHT;
    }

    const scale =
      Math.max(coverW / img.width, coverH / img.height) * zoom;
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = cx - dw / 2 + offset.x;
    const dy = cy - dh / 2 + offset.y;

    if (shape === "circle") {
      const outSize = 512;
      const outCanvas = document.createElement("canvas");
      outCanvas.width = outSize;
      outCanvas.height = outSize;
      const ctx = outCanvas.getContext("2d");
      if (!ctx) return;

      const srcX = (cx - CIRCLE_RADIUS - dx) / scale;
      const srcY = (cy - CIRCLE_RADIUS - dy) / scale;
      const srcW = (CIRCLE_RADIUS * 2) / scale;
      const srcH = (CIRCLE_RADIUS * 2) / scale;

      ctx.beginPath();
      ctx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outSize, outSize);

      outCanvas.toBlob(
        (blob) => { if (blob) onConfirm(blob); },
        "image/webp",
        0.9
      );
    } else {
      // Rectangle export at 1920x1080
      const outW = 1920;
      const outH = 1080;
      const outCanvas = document.createElement("canvas");
      outCanvas.width = outW;
      outCanvas.height = outH;
      const ctx = outCanvas.getContext("2d");
      if (!ctx) return;

      const rx = cx - RECT_WIDTH / 2;
      const ry = cy - RECT_HEIGHT / 2;
      const srcX = (rx - dx) / scale;
      const srcY = (ry - dy) / scale;
      const srcW = RECT_WIDTH / scale;
      const srcH = RECT_HEIGHT / scale;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

      outCanvas.toBlob(
        (blob) => { if (blob) onConfirm(blob); },
        "image/webp",
        0.9
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-background border-border">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-center font-body text-base text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center px-4 pb-4 gap-4">
          {/* Canvas area */}
          <div
            className="relative rounded-lg overflow-hidden touch-none select-none"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
              className="cursor-grab active:cursor-grabbing"
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              onWheel={handleWheel}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 w-full max-w-[280px]">
            <ZoomOut className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[zoom]}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full justify-center">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;
