import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { X, ShoppingCart, Star } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import Image from "next/image"
import { VENDOR_LOGOS } from "../../lib/constants"

interface AISuggestionsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedItems: any[];
  onAddItem: (item: any) => void;
}

export function AISuggestionsOverlay({
  isOpen,
  onClose,
  suggestedItems,
  onAddItem
}: AISuggestionsOverlayProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Handle click outside and ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscKey);
      };
    }
    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Side Panel */}
          <motion.div
            ref={overlayRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 w-[calc(100%-32px)] max-w-[900px] bg-white shadow-lg z-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">AI Suggestions</div>
                    <div className="text-lg font-semibold">Recommended Items</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    {suggestedItems.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Item Image */}
                            <div className="w-24 h-24 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src={item.image || `/placeholder.svg`}
                                alt={item.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            
                            {/* Item Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-medium text-lg">{item.name}</div>
                                  <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                      <span className="text-sm">4.5 (24 reviews)</span>
                                    </div>
                                    {item.status === "Urgent" && (
                                      <Badge variant="destructive" className="h-5 px-1.5 py-0 text-xs font-normal">Urgent</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">${item.unitPrice?.toFixed(2)}</div>
                                  <div className="text-sm text-muted-foreground">per unit</div>
                                </div>
                              </div>

                              {/* Vendor Info */}
                              <div className="mt-4 flex items-center gap-2">
                                <div className="relative h-8 w-8 rounded-full overflow-hidden border bg-white">
                                  <Image
                                    src={VENDOR_LOGOS[item.vendor as keyof typeof VENDOR_LOGOS] || VENDOR_LOGOS.default}
                                    alt={item.vendor}
                                    fill
                                    className="object-contain p-1"
                                  />
                                </div>
                                <div className="text-sm text-muted-foreground">{item.vendor}</div>
                              </div>

                              {/* Add to Order Button */}
                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  className="w-full gap-2"
                                  onClick={() => onAddItem(item)}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  Add to Order
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 