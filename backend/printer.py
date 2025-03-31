from typing import Dict, Any
from rich.console import Console, Group
from rich.live import Live
from rich.spinner import Spinner

class Printer:
    def __init__(self):
        self.console = Console()
        self.live = Live(console=self.console)
        self.items: dict[str, tuple[str, bool]] = {}
        self.hide_done_ids: set[str] = set()
        self.live.start()
        
    def end(self) -> None:
        """Stop the live display"""
        self.live.stop()

    def update_item(
        self, item_id: str, content: str, is_done: bool = False, hide_checkmark: bool = False
    ) -> None:
        """
        Update or add an item to the display
        
        Args:
            item_id: Unique identifier for this item
            content: Text content to display
            is_done: Whether this item is complete
            hide_checkmark: Whether to hide the checkmark when done
        """
        self.items[item_id] = (content, is_done)
        if hide_checkmark:
            self.hide_done_ids.add(item_id)
        self.flush()

    def mark_item_done(self, item_id: str) -> None:
        """Mark an item as complete"""
        if item_id in self.items:
            self.items[item_id] = (self.items[item_id][0], True)
            self.flush()

    def flush(self) -> None:
        """Update the display with current items"""
        renderables: list[Any] = []
        for item_id, (content, is_done) in self.items.items():
            if is_done:
                prefix = "✅ " if item_id not in self.hide_done_ids else ""
                renderables.append(prefix + content)
            else:
                renderables.append(Spinner("dots", text=content))
        self.live.update(Group(*renderables))

    # Keep the original methods for backward compatibility
    def print_step(self, message: str):
        """Legacy method - prints a step in the process."""
        self.update_item(f"step_{len(self.items)}", message, is_done=True)
        
    def print_results(self, results: Dict[str, Any]):
        """Legacy method - prints the final results."""
        output = [
            "\n=== SEARCH RESULTS ===",
            f"Query: {results['query']}",
            "\nWebsites searched:"
        ]
        
        for website in results['websites']:
            output.append(f"- {website}")
            
        output.append("\nProducts found:")
        for product in results['results']:
            output.extend([
                f"\nProduct: {product['name']}",
                f"Price: {product['price']}",
                f"URL: {product['url']}"
            ])
            
        self.update_item("results", "\n".join(output), is_done=True) 