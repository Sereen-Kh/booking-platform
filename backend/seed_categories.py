"""
Seed script to add all categories from the frontend
Run this to populate the categories table with icon and color information
"""
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import SessionLocal
from app.models.service import Category


async def seed_categories():
    async with SessionLocal() as db:
        # Define all categories from frontend with icon and color
        categories_data = [
            {
                "name": "Home Services",
                "description": "Home cleaning, plumbing, electrical, and repairs",
                "icon": "Home",
                "color": "hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30"
            },
            {
                "name": "Beauty & Spa",
                "description": "Hair styling, makeup, nails, and spa treatments",
                "icon": "Scissors",
                "color": "hover:bg-pink-500/10 hover:text-pink-600 hover:border-pink-500/30"
            },
            {
                "name": "Wellness",
                "description": "Massage therapy, yoga, meditation, and holistic health",
                "icon": "Heart",
                "color": "hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30"
            },
            {
                "name": "Automotive",
                "description": "Car repair, maintenance, detailing, and towing",
                "icon": "Car",
                "color": "hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30"
            },
            {
                "name": "Fitness",
                "description": "Personal training, group classes, and sports coaching",
                "icon": "Dumbbell",
                "color": "hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
            },
            {
                "name": "Photography",
                "description": "Events, portraits, commercial, and product photography",
                "icon": "Camera",
                "color": "hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/30"
            },
            {
                "name": "Pet Care",
                "description": "Pet grooming, training, walking, and veterinary services",
                "icon": "PawPrint",
                "color": "hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-500/30"
            },
            {
                "name": "Professional",
                "description": "Business consulting, legal, accounting, and IT services",
                "icon": "Briefcase",
                "color": "hover:bg-cyan-500/10 hover:text-cyan-600 hover:border-cyan-500/30"
            },
        ]

        for cat_data in categories_data:
            # Check if category already exists
            result = await db.execute(
                select(Category).where(Category.name == cat_data["name"])
            )
            existing_category = result.scalar_one_or_none()

            if existing_category:
                # Update existing category with icon and color
                existing_category.description = cat_data["description"]
                existing_category.icon = cat_data["icon"]
                existing_category.color = cat_data["color"]
                print(f"Updated category: {cat_data['name']}")
            else:
                # Create new category
                category = Category(**cat_data)
                db.add(category)
                print(f"Created category: {cat_data['name']}")

        await db.commit()
        print("\n✅ Categories seeded successfully!")
        print(f"Total categories: {len(categories_data)}")


if __name__ == "__main__":
    asyncio.run(seed_categories())
