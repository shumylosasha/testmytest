import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search } from "lucide-react"
import { inventoryData } from "@/data/inventory-data"

interface InventorySearchProps {
  onItemSelect: (item: any) => void
  selectedItems: any[]
}

export function InventorySearch({ onItemSelect, selectedItems }: InventorySearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const filteredItems = inventoryData.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearch = () => {
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
    }, 800)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or category..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {searchQuery && (
        <div className="border rounded-md">
          {isSearching ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="divide-y">
              {filteredItems.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="grid grid-cols-[auto,2fr,1fr,1fr,auto] items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => onItemSelect(item)}
                >
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                    <img
                      src={item.image || `/placeholder.svg?height=40&width=40`}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.status && (
                        <Badge 
                          variant={item.status === "Urgent" ? "destructive" : item.status === "Low" ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.sku}</div>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium">{item.currentStock}/{item.totalStock}</div>
                    <div className="text-muted-foreground">in stock</div>
                  </div>

                  <div>
                    <div className="font-medium">{item.vendor}</div>
                    <div className="text-sm text-muted-foreground">${item.unitPrice.toFixed(2)} per unit</div>
                  </div>

                  <Button
                    size="sm"
                    disabled={selectedItems.some((i) => i.id === item.id)}
                  >
                    {selectedItems.some((i) => i.id === item.id) ? "Added" : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No items found. Try a different search term.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 