import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Rectangle, Circle, FancyBboxPatch, Arc
import numpy as np

def draw_room():
    """Draw a 2D redecorated room interior with furniture"""
    
    # Create figure and axis
    fig, ax = plt.subplots(1, figsize=(12, 8))
    
    # Set room boundaries
    room_width = 10
    room_height = 8
    
    # Draw room walls (thicker lines for walls)
    wall = Rectangle((0, 0), room_width, room_height, 
                    fill=False, edgecolor='black', linewidth=3)
    ax.add_patch(wall)
    
    # Add floor pattern (wooden floor effect)
    for i in np.arange(0, room_width, 0.5):
        floor_plank = Rectangle((i, 0), 0.45, room_height, 
                               fill=True, alpha=0.1, color='saddlebrown')
        ax.add_patch(floor_plank)
    
    # ============== ADD FURNITURE ==============
    
    # 1. Sofa (main seating)
    sofa = FancyBboxPatch((1, 1), 3, 1.5, 
                          boxstyle="round,pad=0.1",
                          facecolor='coral', edgecolor='darkred', 
                          linewidth=2, alpha=0.8)
    ax.add_patch(sofa)
    # Sofa cushions (lines)
    for i in range(3):
        cushion_line = plt.Line2D([1.5 + i*0.8, 1.5 + i*0.8], [1, 2.5], 
                                  color='darkred', linewidth=1.5, alpha=0.5)
        ax.add_line(cushion_line)
    ax.text(2.5, 1.8, 'Sofa', ha='center', va='center', fontsize=10, fontweight='bold')
    
    # 2. Coffee table
    coffee_table = Rectangle((2.2, 3), 1.6, 0.8, 
                            facecolor='peru', edgecolor='sienna', linewidth=2)
    ax.add_patch(coffee_table)
    ax.text(3, 3.4, 'Coffee Table', ha='center', va='center', fontsize=9)
    
    # 3. TV Stand
    tv_stand = Rectangle((6, 0.8), 2.5, 1.2, 
                        facecolor='gray', edgecolor='dimgray', linewidth=2)
    ax.add_patch(tv_stand)
    # TV screen
    tv_screen = Rectangle((6.3, 1.0), 1.9, 0.8, 
                         facecolor='black', edgecolor='lightgray', linewidth=1)
    ax.add_patch(tv_screen)
    ax.text(7.25, 1.4, 'TV', ha='center', va='center', color='white', fontsize=9)
    
    # 4. Bookshelf
    bookshelf = Rectangle((0.5, 5), 2, 2, 
                         facecolor='saddlebrown', edgecolor='brown', linewidth=2)
    ax.add_patch(bookshelf)
    # Bookshelf shelves and books
    for i in range(3):
        shelf_line = plt.Line2D([0.5, 2.5], [5.7 + i*0.6, 5.7 + i*0.6], 
                               color='black', linewidth=1)
        ax.add_line(shelf_line)
    # Books (colored rectangles)
    book_colors = ['red', 'blue', 'green', 'yellow', 'purple']
    for i, color in enumerate(book_colors):
        book = Rectangle((0.7 + i*0.3, 5.2), 0.2, 0.4, 
                        facecolor=color, edgecolor='black')
        ax.add_patch(book)
    ax.text(1.5, 6, 'Bookshelf', ha='center', va='center', color='white', fontsize=9)
    
    # 5. Dining table with chairs
    # Table
    dining_table = Rectangle((7, 5), 2, 1.5, 
                            facecolor='tan', edgecolor='sienna', linewidth=2)
    ax.add_patch(dining_table)
    # Table legs
    for x, y in [(7.2, 5), (8.8, 5), (7.2, 6.5), (8.8, 6.5)]:
        leg = Circle((x, y), 0.1, facecolor='brown')
        ax.add_patch(leg)
    # Chairs (simple squares around table)
    chairs = [
        Rectangle((7.8, 4.5), 0.4, 0.4, facecolor='lightblue', edgecolor='blue'),  # bottom
        Rectangle((7.8, 6.6), 0.4, 0.4, facecolor='lightblue', edgecolor='blue'),  # top
        Rectangle((6.5, 5.5), 0.4, 0.4, facecolor='lightblue', edgecolor='blue'),  # left
        Rectangle((9.1, 5.5), 0.4, 0.4, facecolor='lightblue', edgecolor='blue')   # right
    ]
    for chair in chairs:
        ax.add_patch(chair)
    ax.text(8, 5.8, 'Dining', ha='center', va='center', fontsize=9)
    
    # 6. Plant in corner
    plant_pot = Rectangle((9.2, 0.5), 0.5, 0.5, 
                         facecolor='brown', edgecolor='sienna')
    ax.add_patch(plant_pot)
    # Plant leaves (circles)
    for x, y in [(9.3, 1.1), (9.5, 1.2), (9.45, 1.0), (9.2, 1.15)]:
        leaf = Circle((x, y), 0.1, facecolor='forestgreen')
        ax.add_patch(leaf)
    
    # 7. Rug
    rug = Rectangle((0.8, 1.8), 3.5, 2.2, 
                   fill=True, alpha=0.2, facecolor='navy', edgecolor='blue', linewidth=1)
    ax.add_patch(rug)
    
    # 8. Windows
    # Window on left wall
    window_left = Rectangle((-0.2, 3), 0.4, 2, 
                           fill=True, alpha=0.3, facecolor='lightblue', edgecolor='blue')
    ax.add_patch(window_left)
    # Window panes
    ax.add_line(plt.Line2D([-0.2, 0.2], [4, 4], color='blue', linewidth=1))
    ax.add_line(plt.Line2D([0, 0], [3, 5], color='blue', linewidth=1))
    
    # Window on top wall
    window_top = Rectangle((4, 7.8), 2, 0.4, 
                          fill=True, alpha=0.3, facecolor='lightblue', edgecolor='blue')
    ax.add_patch(window_top)
    # Window panes
    ax.add_line(plt.Line2D([5, 5], [7.8, 8.2], color='blue', linewidth=1))
    ax.add_line(plt.Line2D([4, 6], [8, 8], color='blue', linewidth=1))
    
    # 9. Lamp
    lamp_base = Rectangle((4.5, 0.5), 0.3, 0.8, 
                         facecolor='gold', edgecolor='goldenrod')
    ax.add_patch(lamp_base)
    lamp_shade = Circle((4.65, 1.4), 0.4, facecolor='lightyellow', alpha=0.8)
    ax.add_patch(lamp_shade)
    
    # 10. Wall art/picture
    picture = Rectangle((3, 6.5), 2, 1, 
                       facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(picture)
    # Simple drawing on picture
    ax.add_patch(Circle((3.7, 7), 0.2, facecolor='blue'))
    ax.add_patch(Circle((4.3, 7), 0.2, facecolor='red'))
    ax.text(4, 6.8, 'Art', ha='center', va='center', fontsize=8)
    
    # Add title and room label
    ax.text(room_width/2, room_height + 0.3, 'My Redecorated Room', 
            ha='center', va='center', fontsize=16, fontweight='bold')
    
    # Set axis limits and remove axes
    ax.set_xlim(-0.5, room_width + 0.5)
    ax.set_ylim(-0.5, room_height + 0.5)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Add grid lines for floor plan effect (optional)
    ax.grid(True, linestyle='--', alpha=0.3)
    
    plt.tight_layout()
    return fig, ax

def main():
    """Main function to create and display the room"""
    fig, ax = draw_room()
    plt.show()
    
    # Uncomment to save the figure
    # fig.savefig('redecorated_room.png', dpi=300, bbox_inches='tight')

if __name__ == "__main__":
    main()
