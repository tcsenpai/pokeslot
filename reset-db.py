#!/usr/bin/env python3
import os
import sqlite3

def reset_database():
    """Reset the Pokemon Slot Machine database"""
    db_path = "pokeslot.db"
    
    print("🎰 Pokemon Slot Machine Database Reset Utility")
    print("=" * 50)
    
    if os.path.exists(db_path):
        print(f"📁 Found existing database: {db_path}")
        confirm = input("⚠️  This will DELETE ALL user data, coins, and stats. Continue? (yes/no): ")
        
        if confirm.lower() != 'yes':
            print("❌ Reset cancelled.")
            return
        
        # Remove the database file
        os.remove(db_path)
        print("🗑️  Old database deleted.")
    else:
        print("📁 No existing database found.")
    
    # Import the database initialization from backend
    from backend import GameDatabase
    
    # Create fresh database
    print("🏗️  Creating fresh database...")
    db = GameDatabase(db_path)
    
    print("✅ Database reset complete!")
    print("")
    print("📊 Fresh database created with:")
    print("   - Empty user accounts")
    print("   - Clean leaderboards") 
    print("   - Reset session data")
    print("")
    print("🎮 All players will start fresh with 100 coins")
    print("🔄 Restart the game servers to apply changes")

if __name__ == "__main__":
    reset_database()